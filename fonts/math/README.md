# Alpha Math

The maths face for the Chia sẻ kinh nghiệm equations. One file,
`alpha-math.woff2` (67 KB), downloaded only by the pages that contain a `<math>`
element.

## What it is

A subset of **TeX Gyre Schola Math** (GUST e-foundry), which is
[New Century Schoolbook](http://www.gust.org.pl/projects/e-foundry/tex-gyre/schola)
with a full OpenType `MATH` table.

Schola was chosen out of the TeX Gyre maths faces (Termes/Times,
Pagella/Palatino, Bonum/Bookman) because it is the one built on the same virtues
as Literata: sturdy serifs, low stroke contrast, a large x-height, drawn to be
read rather than admired. Beside Literata it reads as the same voice.

## What it is used for

Only what Literata cannot draw. Letters and digits inside an equation are
Literata (`_sass/chia-se-kinh-nghiem/_theme.scss` → `mi, mn, mtext`); this font
supplies the radical, the brackets stretched around a fraction, and the
operators. It is the only font here with an OpenType `MATH` table — the table a
browser reads to size a √ to its contents — so no reading face can replace it.

Without it, each browser reaches for whatever maths font its OS happens to ship
(Cambria Math on Windows, Latin Modern on Firefox, STIX on Safari), and the
equations look like a different website on every machine.

## Licence

GUST Font License (LPPL 1.3c) — see `GUST-FONT-LICENSE.txt`. It *requests* that
derived works be renamed, and a subset is a derived work, so this one is called
Alpha Math and names its origin in the font's own description field.

## Regenerating it

Needs `fontTools` and `brotli` (`pip install fonttools brotli`) — neither is a
repo dependency; the font is a build output committed once, not on every build.

```python
# source: https://mirrors.ctan.org/fonts/tex-gyre-math/opentype/texgyreschola-math.otf
from fontTools import subset

UNI = ("U+0020-007E,U+00A0,U+00AC,U+00AF,U+00B0,U+00B1,U+00B7,U+00D7,U+00F7,"
       "U+0370-03FF,U+2013-2014,U+2018-201D,U+2026,U+2032-2033,U+203E,U+2044,"
       "U+2061-2064,U+2070-209F,U+2190-2199,U+2200-22FF,U+2308-230B,U+27E8-27E9")

opts = subset.Options()
opts.layout_features = ["*"]          # keep ssty et al. — maths shaping needs them
opts.name_IDs = ["*"]
opts.glyph_names = True
opts.flavor = "woff2"
opts.drop_tables += ["FFTM"]

font = subset.load_font("texgyreschola-math.otf", opts)
s = subset.Subsetter(options=opts)
s.populate(unicodes=subset.parse_unicodes(UNI))
s.subset(font)                        # fontTools closes the glyph set over MATH,
                                      # so the stretch variants survive
# …then rename family/full/PostScript names to "Alpha Math" and credit the
# original in name ID 10, per the licence.
subset.save_font(font, "alpha-math.woff2", opts)
```

The whole `U+2200-22FF` block is kept rather than only the operators today's
posts use: an operator that is missing does not fail the build, it just falls
back to the OS maths font and looks subtly wrong. The 17 KB that costs is worth
not having to debug that.
