# Chia sẻ kinh nghiệm — Ký hiệu khoa học (the scientific notation standard)

**Normative.** Every symbol, formula, equation, unit and structure on this hub is
set the way this file says, whether it is post 15 or post 1000. `02-authoring-guide.md`
§3b–§3c is the short version for someone writing a post; when the two disagree,
this file wins.

**The standing decision** (owner, 2026-08-02): *"Làm MỌI THỨ đúng theo chuẩn
quốc tế… cả Hóa học lẫn Toán học, Vật lý."* The site follows the international
standards rather than a private house style:

| Domain | Standard |
|---|---|
| Maths, physics, quantities | **ISO 80000-2** |
| Units and numerical values | **ISO 80000-1** / BIPM SI Brochure |
| Chemistry | **IUPAC**, encoded as **mhchem** (`\ce{}`) |

Everything below is that, made mechanical. Where the site deviates, §6 records
the deviation, the reason and the date — nothing is left to memory.

## 0. Decisions of record

Read this table before re-litigating anything.

| Date | Decision | Why |
|---|---|---|
| 2026-08-02 | Chemistry is written `\ce{}` (mhchem), on the same `$$…$$` rail as maths | Refusing to invent a private dialect; it is what Wikipedia, journals and textbooks use |
| 2026-08-02 | A dangling bond is `\bond{-}`, a charge is `^-` | A bare trailing `-` silently renders as an ionic charge (§2) |
| 2026-08-02 | ISO 80000-2 italics replace the old blanket "everything upright" rule | Owner's standing decision; the old rule made *E*, *L*, *n* wrong |
| 2026-08-02 | ISO 80000-1 no-break space between value and unit | Applied to all 15 live posts, not just new ones |
| 2026-08-02 | **`%` stays closed up** (`4,5%`) | Owner's exception: "4,5 %" reads foreign in Vietnamese trade prose |
| 2026-08-02 | Structural diagrams stay pictures; no SMILES auto-renderer | Skeletal output is not how this author teaches (§5) |

## 1. Italic or upright — ISO 80000-2

The single rule: **a quantity is italic; everything else is upright.**

| Set | | Examples |
|---|---|---|
| Quantity, variable | *italic* | *E*, *L*\*, *a*\*, *b*\*, *C*\*, *h*\*, *S*, *l*, *c*, the polymer index *n* |
| Operator | upright | Δ (difference), d (differential), ∂, ∑ |
| Function name | upright | sin, cos, log, exp, lim |
| Abbreviation, name | upright | CMC (a committee), the "kin" in *E*<sub>kin</sub> |
| Unit symbol | upright | g, L, m, nm, K, °C |
| Chemical element or formula | upright | C, H, N, O, NH, CH₂ |
| Number | upright | 2, 5, 100 |

**Subscripts follow the same test, one level down.** A subscript that names a
*quantity* is italic (*S*<sub>*L*</sub> — L is lightness, the same L as *L*\*);
a subscript that is an *abbreviation* is upright (Δ*E*<sub>CMC</sub>).

### It is automatic — do not hand-tune it

`optimize-math.mjs` derives all of the above from what KaTeX already emits:
KaTeX marks everything it knows is not a variable (`\mathrm{}`, mhchem's element
symbols, uppercase Greek), and leaves a bare identifier otherwise. The build adds
one correction — a bare identifier of **more than one character** is a function
name, so it stays upright — and tags the rest `.kt-var`.

So write `\Delta E^*` and `S_L` plainly and you get Δ*E*\* and *S*<sub>*L*</sub>,
right first time. Reach for `\mathrm{}` **only** when a subscript is an
abbreviation: `\Delta E_{\mathrm{CMC}}`, `E_{\mathrm{kin}}`.

### Why the italic is CSS and not a mathvariant

Every `<mi>` keeps `mathvariant="normal"`, including the italic ones, and the
slant comes from `.kt-var { font-style: italic }` against the real Literata
italic face. That is not a workaround, it is the only correct route: without the
attribute the browser applies `text-transform: math-auto` and **swaps the
character** — L (U+004C) becomes 𝐿 (U+1D43F), a codepoint no reading face has a
glyph for, so the letter falls out of Literata into whatever maths font the OS
ships. A real italic in the body face is what the standard is asking for; a
substituted codepoint never was.

**Gap:** no Literata italic *Greek* subset is loaded, so a lowercase Greek
quantity would be synthesised. None is in use. Load the subset before shipping
the first one.

## 2. Chemistry — `\ce{}`

Chemistry uses the **same `$$…$$` delimiter as maths**, because it takes the same
path: kramdown hands the TeX through, `optimize-math.mjs` renders it with KaTeX +
mhchem at build time, and the page ships static MathML with no library.

```markdown
Liên kết amide $$\ce{\bond{-}CO-NH\bond{-}}$$ giữ các chuỗi lại với nhau.

$$\ce{\bond{-}[NH-(CH2)5-CO]_n\bond{-}}$$
```

Inside `\ce{}` you do not type subscripts or spacing: **mhchem knows chemistry.**
`CH2` becomes CH₂, `SO4^2-` becomes SO₄²⁻, `2Na+` spaces its coefficient.
Element symbols come out upright and the repeat index *n* italic, per §1,
automatically. Never write `\mathrm{}` around an element symbol — mhchem did it.

### Bonds

| Bond | Write |
|---|---|
| Single, **between two atoms** | `-` |
| Double | `=` |
| Triple | `#` |
| **Dangling (open valence)** | `\bond{-}` |
| Hydrogen bond, weak association | `\bond{...}` |
| Partial / delocalised | `\bond{~}` `\bond{~-}` `\bond{~=}` |

### The trap: a trailing `-` is a CHARGE, not a bond

This shipped wrong for a few hours and the owner caught it by eye (2026-08-02),
so it gets its own heading. mhchem reads a `+` or `-` at the end of a formula
unit as an **ionic charge** and raises it into a superscript:

```
\ce{-CO-NH-}                →  −CO−NH⁻     an amide ANION. Chemically false.
\ce{-[NH-(CH2)5-CO]_n-}     →  −[NH−(CH₂)₅−CO]ₙ⁻
\ce{[-NH-(CH2)5-CO-]_n}     →  the -] charges too. Brackets do not save you.
```

It looks almost right, which is why it survives review: the dash is *there*, it
is merely 6px too high, and only someone who reads formulas for a living
registers that the molecule just acquired a charge.

**The rule, both halves:**

- an open valence at either end of a fragment is **`\bond{-}`**, never a bare `-`;
- a real charge is **`^-` / `^+`**, never a bare trailing sign — `\ce{D-SO3^-}`,
  not `\ce{D-SO3-}`.

`\bond{-}` emits the identical `<mo lspace="0em" rspace="0em">−</mo>` an internal
bond does, so it is the same glyph on the same baseline; it only tells the parser
what you meant. With both halves in force a bare terminal sign is always a
mistake, which is what makes it gateable (§6).

```markdown
$$\ce{\bond{-}CO-NH\bond{-}}$$              ✓  −CO−NH−
$$\ce{\bond{-}[NH-(CH2)5-CO]_n\bond{-}}$$   ✓  −[NH−(CH₂)₅−CO]ₙ−
$$\ce{\bond{-}(CH2)_n\bond{-}}$$            ✓  −(CH₂)ₙ−
```

A leading bare `-` happens to render as a bond today. Write `\bond{-}` there
anyway: the intent belongs in the source, not in a parser's tie-break.

### Arrows, charges, states

| Meaning | Write |
|---|---|
| Goes to | `->` |
| Comes from | `<-` |
| Equilibrium | `<=>` |
| Both directions | `<-->` |
| Strongly one side | `<=>>` / `<<=>` |

Conditions ride **on** the arrow, never in the prose beside it: `->[above][below]`.

```markdown
$$\ce{R-N=N-R' + 4[H] ->[\text{Na2S2O4}][\text{60 °C}] R-NH2 + R'-NH2}$$
$$\ce{-NH2 + H+ <=> -NH3+}$$
$$\ce{SO4^2-}$$                  charge
$$\ce{Na2CO3(aq)}$$              states: (s) (l) (g) (aq)
$$\ce{CaCO3 v}$$                 precipitate;  ^ is gas
$$\ce{D-SO3^- \bond{...} ^+H3N-F}$$    the dye–fibre salt link
```

`[H]` is nascent hydrogen; `R'` is a prime. Both are mhchem idioms — use them.

### Polymer repeat units

Two spellings are valid; the site uses the first, because it is what the author
writes and what the Nylon diagram draws:

```markdown
$$\ce{\bond{-}[NH-(CH2)5-CO]_n\bond{-}}$$    canon: open bonds outside the bracket
$$\ce{[\bond{-}NH-(CH2)5-CO\bond{-}]_n}$$    also correct: bonds inside
```

Pick the one the author's own source uses and stay with it inside a post. The
system governs the **encoding**, never his chemistry style.

### The floor — what stays plain prose

`\ce{}` is for things with **a bond, a subscript, a charge, an arrow or a state.**
Everything else is ordinary text:

- bare names and acronyms: polyamide, caprolactam, pH, DMF, PVA, UV, spandex;
- an element symbol used as a word: "nhóm N", "gốc R";
- units in prose (§3).

"nhóm N-H" has a bond, so it is `$$\ce{N-H}$$`. "độ pH" has nothing, so it is
text. The test is mechanical on purpose — nobody should have to have taste about
it at 11pm.

## 3. Units and numbers — ISO 80000-1

**A no-break space separates a value from its unit symbol.** `215–220 °C`,
`380 nm`, `6500 K`, `20 mm`, `200 kg`. No-break (U+00A0) rather than a plain
space because BIPM asks that a value never orphan from its unit across a line
break — and because it survives the HTML minifier, which collapses ordinary runs
of whitespace.

Three exceptions, all deliberate:

| Exception | Why |
|---|---|
| **`%` stays closed up** — `4–4,5%`, `OEE 60%` | Owner's call, 2026-08-02. SI does ask for a space; "4,5 %" reads foreign in Vietnamese trade prose, and this is prose for a dyehouse, not a paper. |
| **Plane angle stays closed up** — `0°`, `90°`, `10° observer` | SI's *own* exception: ° ′ ″ for plane angle take no space. |
| **Clock notation** — `6h05 ÷ 8h` | The author's way of writing a shift, not an SI quantity expression. Rewriting it to `6 h 05 min` would damage the sentence to satisfy a rule it is not under. |

Alongside, unchanged and still house style:

- **Decimal comma**, Vietnamese: `4,5%`, `1,5 °C/phút`, `6,6 mm`.
- **Ranges take an en dash**, no spaces: `215–220 °C`, `4–4,5%`.
- `\pu{}` typesets a quantity inside maths (`\pu{4,5 g//L}`). Use it **only
  inside or beside an equation** — in running prose a unit is prose. Turning
  every number into maths is the same mistake as turning every formula into a
  picture, pointed the other way.

## 4. Vietnamese typography around science

- The author capitalises material and monomer names (Nylon, Caprolactam, Acid
  Adipic, Polyamide). That is his voice — keep it, do not "fix" it to lowercase.
- A picture may write `Nylon 66` while the prose writes `Nylon 6.6`. Alt text
  follows **the picture**; prose follows **the author**.
- Headings and front matter are **plain text**: `## Cấu tạo hóa học`, and a
  `description:` that says "nhóm N-H" in words. They become the `<title>`, the og
  tags and the feed card, where markup cannot go. A subscript in a heading is
  `<sub>`, not maths.

## 5. Diagrams — three tiers, lowest first

Ask one question: **does the thing have 2D geometry?**

| Tier | What | How | Use when |
|---|---|---|---|
| **1** | Linear: formulas, groups, ions, repeat units, whole reaction equations | `$$\ce{…}$$` → MathML | **Default.** Anything that reads left to right. |
| **2** | 2D structure: rings, skeletal formulas, mechanism arrows | Hand-authored inline SVG | Only when geometry carries the meaning. |
| **3** | A diagram that cannot be redrawn | Image library (02 §2b, 04) | Last resort, and for card faces. |

**Always take the lowest tier that can carry the meaning**, because the tiers
lose properties as they climb. Tier 1 is real text: selectable, searchable,
indexed, spoken correctly by a screen reader, sharp at 400% zoom, correct in any
theme, zero assets. Tier 3 is none of those — a JPEG of a formula is a picture of
information. When a Tier-3 picture and a Tier-1 formula show the same thing (the
Nylon post does, because the card needs a face), **the `\ce{}` text is
authoritative** and the picture is the visual anchor. Never let a formula exist
only inside a JPEG.

### Tier 2 spec, for the day a ring arrives

- **`stroke="currentColor"`**, never a hard colour — inherits the page ink, so it
  is automatically right in the hub's auto dark mode.
- **One stroke width for all bonds** (1.5 at a 24px-per-bond scale), so two
  structures in two posts look like one hand drew them.
- **Labels in the reading face** via the page's CSS; element labels upright,
  matching the `\ce{}` beside them.
- **`viewBox` + `width: 100%`**, no fixed pixel size.
- **`<title>` + `<desc>` inside the `<svg>`**, plus `role="img"`.
- Same caption discipline as `figure.html`; it goes where it teaches.

An auto-generated skeletal renderer (SMILES → SVG, e.g. `openchemlib` at build
time) was considered and **rejected as the default**: its output is
database-style skeletal notation — implicit carbons, no explicit hydrogens —
which is not how this author teaches, and not how the Nylon diagram is drawn. It
stays available as an escape hatch if a post ever needs a dozen structures at
once. Build `figure-chem.html` to this spec when the first structure actually
arrives; not before, because an include with no caller is a guess.

### Tier 3 extra requirement

**The alt text spells out the chemistry in words**, because the picture is the
only copy a non-sighted reader gets: "chuỗi Nylon 6 lặp lại một mắt xích gồm nhóm
N-H, năm nhóm CH2 và một nhóm C=O", not "sơ đồ cấu tạo Nylon 6".

## 6. Build gates

The standard is only worth what the build enforces. `verify.mjs` fails on all of
these, loudly, before `docs/` is replaced:

| Gate | Catches |
|---|---|
| Raw `\[` / `\(` in a hub page | optimize:math did not run; the equation never rendered |
| `<strong>`/`<em>` wrapping a `<math>` | the minifier eats the word space beside it |
| A bare `<mi>` | the ISO variant pass regressed; the letter would leave Literata |
| Bare `-`/`+` before `}` `]` `)` inside `\ce{}` | a dangling bond written as a charge (§2) |
| A digit touching `°C nm mm cm kg K` | missing ISO 80000-1 unit space (§3) |
| Unicode subscript `₀–ₜ` | a formula hand-typed instead of `\ce{}` |

A malformed `\ce{}` or equation throws inside KaTeX and fails the build on its
own. That is the feature.

## 7. Live examples

| Post | Notation | Tier |
|---|---|---|
| Phân biệt Nylon 6 và Nylon 6.6 (2026-08-02) | `\ce{\bond{-}[NH-(CH2)5-CO]_n\bond{-}}`, `\ce{\bond{-}CO-NH\bond{-}}`, `\ce{N-H}` | 1, with a Tier-3 card face |
| Các giá trị trả về từ máy đo màu | `\Delta E_{\mathrm{CMC}} = \sqrt{(\Delta L^*/l\,S_L)^2 + …}` — Δ upright, *E L S l c* italic, CMC upright | — |
| Ánh sáng và nguồn sáng chuẩn | `380 nm`, `6500 K` — §3 spacing | — |
