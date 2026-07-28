# Alpha Math

The maths face for the Chia sẻ kinh nghiệm equations. One file,
`alpha-math-2.woff2` (~96 KB), downloaded only by the pages that contain a
`<math>` element. The `-2` in the name is the cache-buster: the font URL is not
fingerprinted by the build, so a reshaped glyph has to ship under a new name or
returning visitors keep the old file for as long as the CDN lets them.

## What it is

A subset of **TeX Gyre Schola Math** (GUST e-foundry), which is
[New Century Schoolbook](http://www.gust.org.pl/projects/e-foundry/tex-gyre/schola)
with a full OpenType `MATH` table — with one deliberate modification, described
below.

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

## The reshaped radical (why this is not a plain subset)

A browser draws the radical's overbar itself: the font supplies the √ hook and
the engine paints a rule of `RadicalRuleThickness` over the radicand. Schola,
like every TeX-lineage face, ends the hook in a flat stub exactly one
rule-thickness tall and expects the bar to be laid exactly on top of it — TeX's
own model. Chromium instead centres its bar on the glyph's topmost ink (Blink
takes the stretched glyph's ascent from its ink box, then shifts the
pixel-snapped bar up by half its height), so the bar always rode half a
thickness above the stub and the stub poked out half a thickness below: a
visibly broken joint at every size, wobbling with zoom as the snapping rounded
differently. Latin Modern's radical welds cleanly in the same engine because
its tip is a narrow point that sits entirely inside the bar's band wherever the
bar lands. `build-alpha-math.py` rebuilds Schola's terminal on that principle —
underside of the stub raised to half a rule-thickness, flat top replaced by a
bevel rising to a point at the far right — on the base glyph, all six size
variants, and the assembly top piece. The joint is seamless in Chromium's
centred model and in Gecko/WebKit's top-aligned one alike.

## Coverage

Everything an article could plausibly type: ASCII, Greek, primes, arrows
(single, double ⇒, long ⟶, supplemental), the full binary/relation operator
block, letterlike ℝ ℓ ℮, n-ary ⨀⨁⨂, geometric ▽ □, floors/ceilings/angle
fences, norms ‖, combining accents for \vec and \hat. A symbol that is missing
does not fail the build — it silently falls back to the OS maths font and looks
subtly foreign — so the net is cast wide; the whole set costs ~96 KB. The one
deliberate omission is the styled maths alphabets (U+1D400–1D7FF, ~1000 glyphs,
would double the file): the hub sets variables upright in Literata, so those
only appear if an author writes `\mathbf{}`/`\mathcal{}`, and that falls back
gracefully.

## Licence

GUST Font License (LPPL 1.3c) — see `GUST-FONT-LICENSE.txt`. It *requests* that
derived works be renamed, and a subset with a reshaped glyph is emphatically a
derived work, so this one is called Alpha Math and names its origin in the
font's own description field (name ID 10).

## Regenerating it

Needs `fontTools` and `brotli` (`pip install fonttools brotli`) — neither is a
repo dependency; the font is a build output committed once, not on every build.

```sh
curl -LO https://mirrors.ctan.org/fonts/tex-gyre-math/opentype/texgyreschola-math.otf
python build-alpha-math.py texgyreschola-math.otf
```

The script performs the radical surgery, subsets, renames, and writes
`alpha-math-2.woff2`. If a glyph is ever reshaped again, bump the output
filename (and the URL in `_sass/chia-se-kinh-nghiem/_fonts.scss` plus the
must-ship list in `verify.mjs`) — see the cache note at the top.
