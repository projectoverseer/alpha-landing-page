# Chia sẻ kinh nghiệm — Active learning

**Shipped 2026-08-09, all 16 posts.** This document owns the two blocks that
turn an article from something read into something retained: the **opening
block** between the title block and the prose, and the **closing block** above
the signature. `01-philosophy.md` says why the hub is shaped the way it is;
`03-element-spec.md` says what every piece of it is; this file says why these
two pieces exist, what may go in them, and what may never.

Everything here obeys `design/08-quy-cu.md` for behaviour and `01-philosophy.md`
for look and voice. Where this file and those disagree, fix the disagreement in
the same commit.

---

## 1. The problem this solves, stated honestly

The hub's articles were already good. What they were not was **sticky**, in
either sense: a reader arriving from Facebook could bounce at paragraph three,
and a reader who finished had nothing to do with what they had just read.

The owner set the trade-off, and it is the axis this whole design turns on
(2026-08-09):

> Người đọc không đọc hoặc không đọc hết bài còn tệ hơn có đọc qua bài mà không
> có những phương pháp interactive. Vì một người không đọc walk away with
> nothing, còn người có đọc sẽ walk away với một thứ gì đó họ tâm đắc.

So **engagement is not in tension with learning here; it is the precondition for
it.** A pedagogically perfect exercise at the bottom of a page nobody reaches is
worth nothing. That is why the strongest element sits at the *top*, and why it
had to be something that works as a hook and as a teaching device at the same
time.

## 2. Four positions, four jobs

A question does a different job depending on where in the reading it sits. Two
of the four are shipped; the other two are named so nobody re-invents them badly.

| Position | Job | Shipped |
|---|---|---|
| **Before the prose** | Prepare the memory, and hold the reader | **Yes** — the opening block |
| During | Deepen ("why is that so?") | Not yet, §7 |
| **After the prose** | Consolidate, and hand over something to do | **Yes** — the closing block |
| Weeks later | Make it last | **Yes**, folded into the opening block as `kind: recall` |

**Why the top one matters most.** A question asked *before* the material
improves what the reader takes from it, and it does so **even when the guess is
wrong** — the failed retrieval opens a slot the prose then fills. That is the
pretesting effect (Richland, Kornell & Kao, 2009). It happens to be the same
mechanism as a good YouTube cold open: an unresolved question is uncomfortable,
and the discomfort is what keeps the page scrolling. One element, both jobs.
This is the reason the opening block earns space above the first paragraph even
though `philosophy §2.1` says the text is the interface.

**Why the bottom one is two things.** Retrieval practice is the single
best-evidenced study technique there is (Dunlosky et al., 2013, rate it and
spacing the only two of ten at "high utility"; Roediger & Karpicke, 2006,
measured ~61% vs ~40% retention at one week for testing vs re-reading). But a
quiz alone ends the article on a test. So the block closes with **one thing to
do at the reader's own factory**, which is what "walk away with something they
value" cashes out to, and which is also the last thing they read.

## 3. The two blocks

### Opening block — `hoc.html variant="open"`

Rendered by **the layout**, not from Markdown: Markdown content begins below the
header, and this belongs above the first paragraph. It sits **after the lead
figure**, deliberately — the hero is the preloaded LCP element, and pushing it
down the page to make room would trade a measured speed number for a layout
preference.

Two kinds, one per post, never both:

**`kind: hook`** — a multiple-choice question *this* article answers. Three or
four options, and **every option gets the same reply**: a single promise line
naming where the answer lives. Nothing is scored, nothing is revealed. The
answer is the reason to keep reading.

**The block says so before the reader taps** (owner, 2026-08-09): a line under
the label reads *"Bạn thử đoán trước. Đáp án không hiện ra ở đây mà nằm trong
bài bên dưới."* Without it, tapping an option and getting no verdict reads as a
broken control; with it, the same silence reads as the point. It sits above the
options, not below them, because a rule learned after the tap is learned too
late. `verify.mjs` fails the build if a hook loses it — or if a `recall` block
carries it, since that one does answer on the spot.

**The promise points down, and says to come back.** One shape on every post:
name the section, say it is *ở bên dưới*, and say to compare afterwards. Not
"here is a hint" but "the answer is further on, and you will want to check
yourself against it" — the comparison is where the pretest pays off.

> Hard rule: **the promise must be kept.** If the named section does not answer
> the question, the block is clickbait and it costs the hub the one thing it has
> (`philosophy §1`: the marketing value comes from being genuinely useful). This
> is not a style note. It is the line between this design and the thing this
> design is often mistaken for.

**`kind: recall`** — a question from an **older** post whose answer is the
ground today's piece stands on, as a `<details>` with the answer and a link
back. Four lines doing three jobs: spacing (the second "high utility"
technique), priming for today's article, and a contextual internal link.

Cadence: Cepeda et al. (2008) put the useful gap at roughly 10–20% of the
retention interval, so for something a reader should still have in six months,
three to four weeks. The hub publishes weekly, which puts the right source
**three or four posts back**. No algorithm, no stored state — an editorial rule.

Only 2 of the 16 posts use `recall` today, because the archive is young and the
connection has to be real. As the library grows this should become the more
common of the two.

### Closing block — `hoc.html variant="end"`

Written in the post's Markdown on the line directly above the signature include
— the same convention every other editorial element on this hub follows.

1. **`h2` "Kiểm lại vài điểm", and nothing else.** It briefly carried a lead
   sentence explaining what retrieval practice does for your memory; the owner
   cut it on 2026-08-09 as arrogant, and he was right. A director with thirty
   years on the floor does not need a website explaining how his own learning
   works. **Keep every word in this block neutral.** If a sentence sounds like
   it is teaching the reader about himself rather than about dyeing, it goes.
2. **Two questions**, four options each, **an explanation on every option**
   including the wrong ones. Two, not three: see §6.1.
3. **"Áp dụng tại xưởng của bạn"** — one concrete action, doable this week,
   with the data they already have. (Named "Việc mang về xưởng" for one day.)

**There is no reset button.** It existed to lower the cost of guessing and was
cut for the space; picking a different option in a group already replaces the
answer, which is the only undo anyone reaches for.

## 4. How to write a question

This is the part that decides whether the feature is worth anything, and it is
authoring, not code.

**Every answer must be traceable to a sentence in its own article.** No outside
facts, ever. The author of these pieces has 28 years on the floor; one invented
number costs the whole feature its credibility, and it would be a *deserved*
loss.

**Ask what must be inferred, not what must be recalled.** The best question on
the hub combines the pH range of each acid dye group with a warning about
Spandex from a different section. Neither sentence contains the answer. That is
what makes the learning transfer to the floor instead of staying on the page.

**The wrong options are where the teaching happens.** Little & Bjork (2015)
found that multiple choice with genuinely *competitive* alternatives improves
retention of related material that was never asked about, because the reader has
to generate a reason to reject each one. A throwaway distractor teaches nothing
and signals that the question is a formality. So every option carries an
explanation, and a wrong one explains **why it is wrong and what it would be
right for** — "Milling chạy ở pH 5,5–6,5 nên an toàn cho Spandex" is a fact the
reader keeps whether or not they picked it.

**Aim at a confident wrong belief.** The hypercorrection effect (Butterfield &
Metcalfe, 2001): errors made with high confidence, once corrected, are corrected
most durably. The OEE question that offers "khoảng 77%, trung bình cộng của ba
số" exists for exactly this reason — averaging the three components is a mistake
a real manager makes with certainty.

**Voice.** Ask the way a colleague asks, never the way a school asks. "Thử đoán
xem", "Nhóm nào phải loại đầu tiên?", "Ba câu anh nên trả lời được". Never
"Kiểm tra kiến thức của bạn". A director with 30 years on the floor being quizzed
in the register of a training course will close the tab, and be right to.

**What not to write.** A summary block of takeaways written as statements. It is
rated *low* utility in the same survey that rates testing highest, and it is
actively harmful here: skimming six familiar bullets produces the *feeling* of
having learned, which is precisely the illusion a quiz exists to break. If a
recap is wanted, it is a question with the answer folded away.

## 5. Front matter schema

All content lives in the post's front matter — versioned with the article,
absent from the prose, and the single source for both the page and its
structured data.

```yaml
learn:
  open:
    kind: hook            # or: recall
    q: "…"                # both kinds
    options: ["…", "…", "…", "…"]   # hook only, 3–4
    promise: "…"          # hook only — names where the answer is
    a: "…"                # recall only — the answer
    from: "<slug>"        # recall only — the older post's slug
  quiz:
    - q: "…"
      options:
        - { t: "…", why: "…" }                  # a wrong option
        - { t: "…", correct: true, why: "…" }   # exactly one per question
  action: "…"             # optional
```

`from:` is matched against `post.slug`, i.e. the filename with the date prefix
and extension stripped. The title and URL are looked up, never repeated.

## 6. The three rules that keep this from spoiling the reading room

**6.1 · Budget: one opening block, one closing block, two questions.** The same
restraint the CTA policy already imposes (`philosophy §6`), for the same reason.
Zero mid-article learning elements ship today. A post may have a mid-article CTA
*or* a mid-article learning element, never both, and never inside a numbered
sequence or a worked example.

**Two questions, because of what sits underneath.** The owner's ranking is
explicit (2026-08-09): *the share buttons below this block matter more than the
block does.* The quiz exists to leave a reader feeling they got something worth
passing on — and the passing on happens further down the page. Measured in
Chrome, three questions made the closing section **1281px** tall, most of a
phone screen and a half standing between the end of the article and the one
thing we actually want tapped. Styling was squeezed first (the lead sentence,
the reset button, tighter gaps, a smaller heading, a smaller option row), which
got it to about 1050px; dropping the third question took it to **959px**. Which
question goes is a judgement per post, recorded in the trim script: the weakest
is almost always the one asking for a remembered fact rather than an inference.

**The one dimension that never gives ground is the tap target.** An option row
holds at least 44px. The register already refused a thinner scrollbar for this
exact reader — *một người công nhân* with unsteady hands, `design/09 §B5` — and
a quiz row is a far more common target than a scrollbar.

**6.2 · No script may be load-bearing.** The quiz is radio inputs plus `:has()`;
the reveals are `<details>`. The script budget is unchanged at three files
(`philosophy §2.6`), and none of them touches this.

The degradation is **written backwards on purpose**: the per-option explanation
ships *visible* and is hidden only inside `.kt-opt:has(input)`, a selector that
is true wherever `:has()` resolves and false everywhere else. An engine without
`:has()` therefore shows a plain question-and-answer block with every answer
beside its option — plainer, never broken, which is `design/09`'s rule for
table A. Written the obvious way round, those readers would get four dead
options and no answers at all.

**6.3 · No score, no counter, no stored state.** This is the line between
retrieval practice and gamification, and gamification stays banned
(`03-element-spec.md §7.6`, unchanged). A question whose answer teaches
something is pedagogy; a "3/3" with a badge is a game. Nothing is remembered
between visits, nothing is counted, nothing congratulates anybody. The output of
the block is understanding, not a number.

**Green and red, with the words still carrying the meaning** (owner's decision,
2026-08-09; the first cut used words plus the `mark` amber, to protect the
one-accent rule, and he asked for the two colours). Three surfaces take the
verdict and no more: the chosen row's border, the explanation's left edge, and
the word that opens the explanation. The pair, its derivation and its measured
contrast live in `philosophy §3`; the short version is that they are matched in
lightness and separated only by hue, so the page gains a verdict without gaining
a loud object.

**The colour is the echo, never the signal.** Every explanation opens with the
verdict in words — "Đúng." / "Chưa đúng." / "Ngược lại." — and the include takes
the coloured word *from that sentence* rather than generating one, so the two can
never disagree. Roughly one man in twelve cannot separate this pair, and this
hub's readers are mostly men in a Vietnamese dyehouse. Never add a state here
that only the hue distinguishes.

## 7. What was considered and not shipped

Researched in full on 2026-08-09 and deliberately left out of this pass. Each is
a real technique with real evidence; none is free.

- **Self-explanation prompt mid-article** ("why does that follow?"). Moderate
  evidence, near-zero cost. Held back only by §6.1 — most posts already spend
  their one mid-article slot on a CTA. The first candidate for the next pass.
- **Segmented stepper** (the owner's "slideshow"). Mayer's segmenting principle
  is well supported, but it applies to *processes and sequences* only, and a
  stepper that merely re-cuts prose adds taps without adding understanding. The
  natural first case is the five-step spandex process, where the value would be
  the five thresholds, not a re-telling.
- **Contrasting cases before the explanation** (Schwartz & Bransford, 1998) —
  the best-transferring format found in the survey. It is not a component, it is
  an *ordering*: put the comparison table above the explanation instead of
  below. Cheapest thing on this list; it just means editing prose.
- **Interleaved discrimination drill** — the right home is a page at the end of
  a series, mixing cases across its posts, not a block inside one article.
- **Parameterised simulation** — needs real JavaScript and breaks the budget.
  Reserve for a page of its own. Note that most of the value (highlighting one
  part of a diagram at a time) is reachable with `:has()` and no script at all.
- **Gamification, learning-styles branching, reader highlighting tools,
  mnemonics, "re-read this" prompts** — rejected on the evidence, not on taste.
  Recorded here so they are not re-proposed as fresh ideas.

## 8. What this is expected to do, and how we would know

Stated as predictions rather than claims, so they can be checked:

- **Scroll depth and time on page should rise**, driven by the opening block,
  not by the quiz. If only the quiz moves, the hooks are not working.
- **Internal link traffic to older posts should appear** wherever `recall`
  ships — it is the only new internal link on the page.
- **The question-and-answer text is in the DOM as real text**, which is the
  shape featured snippets and answer engines quote most readily. `Quiz` +
  `hasPart: Question` JSON-LD declares it explicitly. Whether Google grants the
  practice-problems rich result is Google's call and is not assumed here; the
  markup is worth carrying either way, and `verify.mjs` gates that it never
  describes an answer the page does not show.

Honest limits: the evidence above is overwhelmingly from students in
laboratories, not from professionals reading voluntarily on a phone. The
*direction* of these effects is about as well established as anything in
cognitive psychology. The *size* of them, on this audience and this surface, is
not known, and this document should be revisited with real numbers rather than
more citations.

## 9. Gates

`verify.mjs` fails the build on all of these, because every one of them ships a
page that looks perfectly fine:

1. An article with no opening block, or no closing block.
2. A question with zero or two correct answers.
3. An opening block that marks a correct answer or carries per-option feedback
   (either would give the answer away and kill the hook); a hook that lost its
   "bạn thử đoán" line; or a recall block that carries it.
4. `Quiz` JSON-LD that does not parse, that declares a different number of
   questions than the page renders, or that names an answer not on the page.
5. The built hub CSS missing any of the four `:has()` rules the quiz needs —
   PurgeCSS has silently dropped a `:has()` rule on this site before
   (`design/09 §A3`).
6. `--ok` or `--no` declared for only one theme. The lit red on the dark paper
   measures about 3:1: readable enough to ship unnoticed, under the floor.
7. Đọc tiếp rendering its cards without the rail container.

## 10. Evolution rules

May change freely (amend this file in the same commit): question wording and
count, the takeaway line, which posts use `recall`, new variants from §7,
type and spacing tuning.

Must survive any redesign (owner decision only):

- The opening block is **one** block, above the prose, a `hook` never reveals
  its answer, and it says so before the reader taps.
- Every answer traceable to the article it sits in.
- Every option carries an explanation, wrong ones included.
- No script the page depends on; the `:has()` degradation stays written
  backwards.
- No score, no streak, no badge, no stored state.
- Correctness carried by words first; green and red only ever agree with them.
- Two questions, and a 44px option row.
