# Builds alpha-math-2.woff2 from TeX Gyre Schola Math.
#
# Needs: pip install fonttools brotli
# Source (not committed, ~580 KB):
#   https://mirrors.ctan.org/fonts/tex-gyre-math/opentype/texgyreschola-math.otf
#
#   python build-alpha-math.py path/to/texgyreschola-math.otf
#
# Two jobs, in order:
#
# 1. RESHAPE THE RADICAL TIP (the reason this script exists).
#    A browser draws the radical's overbar itself: the font supplies only the √
#    hook, stretched to fit, and the engine paints a rectangle of
#    RadicalRuleThickness on top. Schola, like every TeX-lineage face, ends the
#    hook in a flat stub exactly one rule-thickness tall, expecting the bar to
#    be laid exactly on top of it (TeX's own model). Chromium instead CENTERS
#    its bar on the glyph's topmost ink (Blink: StretchyOperatorShaper takes
#    ascent from the ink box; MathMLPainter::PaintBar then shifts the
#    pixel-snapped bar up by half its height). So the bar always rides half a
#    thickness above the stub, and the stub pokes half a thickness out below —
#    a visible broken step at every size, which wobbles with zoom because the
#    snapped bar height rounds differently per size.
#
#    No flat-stub design can survive that placement. Latin Modern's radical
#    welds cleanly in the same engine because its tip is a narrow point that
#    sits entirely INSIDE the bar's band, wherever the bar lands within its
#    half-thickness of slop. This script rebuilds Schola's terminal the same
#    way: the stub's underside is raised from a full rule-thickness (70/1000em)
#    to half (35), and its flat top is replaced by a bevel that rises from the
#    upstroke to a point at the far right. The nib then always lies within the
#    engine-drawn bar, in Chromium's centered model and in Gecko/WebKit's
#    top-aligned one alike, and the diagonal stroke flows into the bar with no
#    step. Applied to the base glyph, all six size variants, and the assembly
#    top piece (radical.tp) used for extremely tall radicands.
#
# 2. SUBSET. Keep every block an article could plausibly use — a symbol that is
#    missing does not fail the build, it silently falls back to the OS maths
#    font and looks foreign, so the net is cast wide (arrows including double
#    and long forms, all binary/relation operators, letterlike ℝ ℓ ℮, n-ary
#    ⨀⨁⨂, geometric ▽ □, fences, combining accents). The one deliberate
#    omission: the styled math alphabets U+1D400-1D7FF (~1000 glyphs, would
#    double the file) — the hub sets variables upright in Literata, so italic/
#    bold/script alphabets only appear if an author writes \mathbf{}/\mathcal{},
#    and that falls back gracefully. fontTools closes the glyph set over the MATH
#    table, so stretch variants and assemblies survive.
#
# The result is renamed Alpha Math per the GUST licence's request that derived
# works not carry the original name; provenance is credited in name ID 10.

import sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.t2CharStringPen import T2CharStringPen

SOURCE = sys.argv[1] if len(sys.argv) > 1 else "texgyreschola-math.otf"
OUT = "alpha-math-2.woff2"

RULE = 70  # RadicalRuleThickness in font units (1000/em)
HALF = RULE // 2

UNI = (
    "U+0020-007E,U+00A0,U+00AC,U+00AF,U+00B0,U+00B1,U+00B7,U+00D7,U+00F7,"
    "U+02C6-02DC,U+0300-030C,U+0370-03FF,"
    "U+2013-2014,U+2016,U+2018-201D,U+2026,U+2032-2037,U+203E,U+2044,"
    "U+2061-2064,U+2070-209F,U+20D0-20DC,U+2100-214F,U+2190-21FF,U+2200-22FF,"
    "U+2308-230B,U+23B4-23E1,U+25A0-25FF,U+27E6-27EF,U+27F0-27FF,U+2A00-2AFF"
)

NAMES = {
    1: "Alpha Math",
    3: "AlphaMath-Regular",
    4: "Alpha Math",
    6: "AlphaMath-Regular",
    10: "Alpha Math is a subset of TeX Gyre Schola Math (GUST e-foundry), "
        "redistributed under the GUST Font License. "
        "Original: http://www.gust.org.pl/projects/e-foundry",
    16: "Alpha Math",
    17: "Regular",
}


def polygon(glyph):
    """The straight-line contour of a radical glyph, as a point list."""
    pen = RecordingPen()
    glyph.draw(pen)
    pts = []
    for op, args in pen.value:
        if op == "moveTo" or op == "lineTo":
            pts.append(args[0])
        elif op != "closePath":
            raise AssertionError(f"unexpected {op} — radical glyphs are line-only")
    return pts


def reshape_variant(pts):
    """Flat 70-unit hook -> beveled 35-unit nib on a radical size variant.

    The contour is 12 points: A(stub bottom-right) B(stub top-right, the ink
    top T) C(stub top-left) D(upstroke top-left edge's foot) E..K(the v) and
    L(stub bottom-left, on the upstroke's right edge). The nib: A rises to
    T-35; the flat top B-C becomes a bevel from B down to the upstroke's upper
    edge at T-35; L rises along the upstroke's lower edge to T-35.
    """
    A, B, C, D, E, F, G, H, I, J, K, L = pts
    T = B[1]
    assert A[0] == B[0] and A[1] == T - RULE and C[1] == T and L[1] == T - RULE, pts
    # C' : on line C-D at height T-35
    cx = C[0] + (T - HALF - C[1]) * (D[0] - C[0]) / (D[1] - C[1])
    # L' : on line K-L extended to height T-35
    lx = L[0] + (T - HALF - L[1]) * (L[0] - K[0]) / (L[1] - K[1])
    return [
        (A[0], T - HALF), B, (round(cx), T - HALF),
        D, E, F, G, H, I, J, K, (round(lx), T - HALF),
    ]


def reshape_top_piece(pts):
    """Same underside lift for radical.tp, the assembly's top-right piece."""
    p0, p1, p2, p3, p4, p5 = pts
    T = p1[1]
    assert p0 == (p1[0], T - RULE) and p5[1] == T - RULE, pts
    return [(p0[0], T - HALF), p1, p2, p3, p4, (p5[0], T - HALF)]


def surgery(font):
    cff = font["CFF "].cff[0]
    charstrings = cff.CharStrings
    glyphset = font.getGlyphSet()
    targets = ["radical"] + [f"radical.v{i}" for i in range(1, 7)] + ["radical.tp"]
    for name in targets:
        pts = polygon(glyphset[name])
        if name == "radical.tp":
            new = reshape_top_piece(pts)
        else:
            new = reshape_variant(pts)
        # T2 charstring widths are encoded relative to the Private dict:
        # omitted when equal to defaultWidthX, else stored as w - nominalWidthX
        # (T2CharStringPen inserts the value verbatim, so adjust here).
        advance = font["hmtx"][name][0]
        private = cff.Private
        if advance == private.defaultWidthX:
            width = None
        else:
            width = advance - private.nominalWidthX
        pen = T2CharStringPen(width, None)
        pen.moveTo(new[0])
        for pt in new[1:]:
            pen.lineTo(pt)
        pen.closePath()
        charstrings[name] = pen.getCharString(
            private=cff.Private, globalSubrs=font["CFF "].cff.GlobalSubrs)
        print(f"  reshaped {name}")


def main():
    font = TTFont(SOURCE)
    surgery(font)

    opts = subset.Options()
    opts.layout_features = ["*"]  # keep ssty et al. — maths shaping needs them
    opts.name_IDs = ["*"]
    opts.glyph_names = True
    opts.flavor = "woff2"
    opts.drop_tables += ["FFTM"]
    subsetter = subset.Subsetter(options=opts)
    subsetter.populate(unicodes=subset.parse_unicodes(UNI))
    subsetter.subset(font)

    name = font["name"]
    for name_id, value in NAMES.items():
        name.setName(value, name_id, 3, 1, 0x409)

    font.flavor = "woff2"
    font.save(OUT)
    print(f"  {OUT}: {font['maxp'].numGlyphs} glyphs")


if __name__ == "__main__":
    main()
