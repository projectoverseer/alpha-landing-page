(() => {
  'use strict';

  /* ======================================================================== *
   *  Squircle engine — CSS `corner-shape` edition.
   *
   *  Replaces the old SVG/clip-path renderer. Instead of rebuilding every
   *  rounded element as an SVG path, it asks the browser to reshape the corner
   *  itself via `corner-shape: superellipse(K)`, keeping native antialiasing,
   *  borders, backgrounds and transitions intact.
   *
   *  THE CORNER SHAPE IS FIXED at n = phi^3 (the golden ratio cubed), a gentle
   *  superellipse sitting just past the n = 4 "squircle" sweet spot. Because n
   *  never changes, every derived number below is precomputed — nothing about
   *  the shape is recalculated at runtime.
   *
   *      n      = phi^3                = 4.2360679774997900
   *      K      = log2(n)             ~= 2.0827   (CSS superellipse() param)
   *      SCALE  = depth-match factor  ~= 1.9404   (see below)
   *
   *  DEPTH MATCH (SCALE). A superellipse of radius r is shallower at the 45°
   *  corner than a circle of the same r, so a raw swap would make every corner
   *  read as "less round". SCALE enlarges the radius so the superellipse's
   *  corner DEPTH equals the original circle's depth — the silhouette stays as
   *  close to the page's authored border-radius as the shape allows, neither
   *  visibly shrunk nor enlarged:
   *
   *      depth(r, n) = r * sqrt(2) * (1 - 2^(-1/n))
   *      SCALE = (1 - 2^(-1/2)) / (1 - 2^(-1/n))      (the sqrt(2)'s cancel)
   *
   *  SAFE FALLBACK. On any browser without `corner-shape` (everything before
   *  Chromium 139) the script returns immediately and never touches a single
   *  style — every element keeps its original, unmodified border-radius.
   * ======================================================================== */

  // ---- precomputed constants (n = phi^3, fixed) ---------------------------
  const CORNER_PARAM = '2.0827';            // K = log2(phi^3), 4-dp
  const SCALE = 1.9404128895326194;         // depth-match radius multiplier
  const FULLY_ROUND_EPS = 0.5;              // px tolerance for "this is a circle"
  const SLICE_MAX_NODES = 1500;             // elements measured per idle slice

  // Tags that never paint a rounded box: skip them BEFORE the (costly)
  // getComputedStyle read instead of measuring then discarding. This only trims
  // work — every element that can actually show a corner is still measured, so
  // the squircle shape is applied exactly as before. (SVG/MathML nodes are
  // already skipped by the `instanceof HTMLElement` gate in the read phase.)
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'BR', 'WBR']);

  // ---- capability gate ----------------------------------------------------
  // `corner-shape` lands in Chromium 139+. Anywhere else: do nothing, cleanly,
  // leaving the authored border-radius exactly as the stylesheet set it.
  if (!(window.CSS && CSS.supports && CSS.supports('corner-shape', 'squircle'))) return;

  // Prefer the tunable function so the exact exponent is honoured; otherwise
  // fall back to the `squircle` keyword (n = 4), the closest built-in shape.
  const CORNER_SHAPE = CSS.supports('corner-shape', 'superellipse(2)')
    ? 'superellipse(' + CORNER_PARAM + ')'
    : 'squircle';

  // ---- state --------------------------------------------------------------
  const seen = new WeakSet();    // element queued/measured at most once
  const ORIG = new WeakMap();    // el -> base [ [h,v] x4 ] radii (pre-scale)
  const managed = new WeakSet(); // el we own: recompute when its class changes
  const tracked = new WeakSet(); // el currently observed for resize
  const pending = [];            // elements awaiting their first measurement
  const roots = [];              // freshly added subtrees awaiting expansion
  let scheduled = false;

  const resizeObserver = window.ResizeObserver
    ? new ResizeObserver((entries) => {
        for (let i = 0; i < entries.length; i++) {
          const el = entries[i].target;
          const corners = ORIG.get(el);
          if (!corners || !el.isConnected) continue;
          const out = compute(el, corners);
          if (out.radius) write(el, out.radius);
        }
      })
    : null;

  // ---- scheduling (initial sweep + new nodes are non-urgent) --------------
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    const run = (deadline) => { scheduled = false; flush(deadline); };
    if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 500 });
    else setTimeout(() => run(null), 16);
  };

  const expand = (root) => {
    if (root.nodeType === 1 && !seen.has(root)) { seen.add(root); pending.push(root); }
    const list = root.querySelectorAll ? root.querySelectorAll('*') : null;
    if (!list) return;
    for (let i = 0; i < list.length; i++) {
      const el = list[i];
      if (!seen.has(el)) { seen.add(el); pending.push(el); }
    }
  };

  const drainRoots = () => {
    while (roots.length) {
      const r = roots.pop();
      if (r && r.isConnected) expand(r);
    }
  };

  // ---- measurement --------------------------------------------------------
  // "12px" (circular) or "12px 8px" (elliptical) per corner — parse both.
  const parsePair = (s) => {
    if (!s) return [0, 0];
    const sp = s.split(' ');
    const h = parseFloat(sp[0]) || 0;
    const v = sp.length > 1 ? (parseFloat(sp[1]) || 0) : h;
    return [h, v];
  };

  const readCorners = (cs) => [
    parsePair(cs.borderTopLeftRadius),
    parsePair(cs.borderTopRightRadius),
    parsePair(cs.borderBottomRightRadius),
    parsePair(cs.borderBottomLeftRadius),
  ];

  const cornersEqual = (a, b) => {
    for (let i = 0; i < 4; i++) {
      if (Math.abs(a[i][0] - b[i][0]) > 0.01) return false;
      if (Math.abs(a[i][1] - b[i][1]) > 0.01) return false;
    }
    return true;
  };

  // Match (scale to preserve corner depth), then per-axis clamp. Capping each
  // corner at half its side keeps the sum along every edge within the side, so
  // the browser never fires its own proportional shrink.
  // Returns { radius: string|null, clamped: bool }. null => no rounded corners.
  function compute(el, corners) {
    const fitH = el.offsetWidth / 2;
    const fitV = el.offsetHeight / 2;
    const fitMin = Math.min(fitH, fitV);
    const laidOut = fitH > 0 && fitV > 0;

    let maxR = 0;
    for (let i = 0; i < 4; i++) {
      if (corners[i][0] > maxR) maxR = corners[i][0];
      if (corners[i][1] > maxR) maxR = corners[i][1];
    }
    if (maxR === 0) return { radius: null, clamped: false };  // not rounded

    // Circle / pill (detected on the ORIGINAL radius, before scaling): a
    // squircle can't be a true circle, so leave it perfectly round.
    if (laidOut && maxR >= fitMin - FULLY_ROUND_EPS)
      return { radius: null, clamped: false };

    const capH = fitH > 0 ? fitH : Infinity;
    const capV = fitV > 0 ? fitV : Infinity;

    let clamped = !laidOut;   // zero-size now -> revisit once it has a box
    let elliptical = false;
    const H = new Array(4), V = new Array(4);
    for (let i = 0; i < 4; i++) {
      const th = corners[i][0] * SCALE;
      const tv = corners[i][1] * SCALE;
      const sh = Math.min(th, capH);
      const sv = Math.min(tv, capV);
      if (th > capH + 0.01 || tv > capV + 0.01) clamped = true;
      if (Math.abs(sh - sv) > 0.01) elliptical = true;
      H[i] = sh; V[i] = sv;
    }

    const f = (n) => n.toFixed(2) + 'px';
    const radius = elliptical
      ? H.map(f).join(' ') + ' / ' + V.map(f).join(' ')
      : H.map(f).join(' ');
    return { radius, clamped };
  }

  function write(el, radius) {
    el.style.setProperty('corner-shape', CORNER_SHAPE, 'important');
    el.style.setProperty('border-radius', radius, 'important');
  }

  // ---- the work slice (initial sweep + newly added nodes) -----------------
  function flush(deadline) {
    drainRoots();
    if (!pending.length) return;

    const chunk = pending.splice(0, SLICE_MAX_NODES);

    // READ PHASE: only reads, so layout/style flush at most once.
    const jobs = [];
    let i = 0;
    for (; i < chunk.length; i++) {
      if (deadline && (i & 255) === 255 && deadline.timeRemaining() < 2) break;
      const el = chunk[i];
      if (!(el instanceof HTMLElement) || !el.isConnected) continue;
      if (SKIP_TAGS.has(el.tagName)) continue;

      const corners = readCorners(getComputedStyle(el));
      const out = compute(el, corners);
      if (!out.radius) continue;
      jobs.push({ el, radius: out.radius, clamped: out.clamped, corners });
    }

    if (i < chunk.length) {
      const rest = chunk.slice(i);
      for (let k = rest.length - 1; k >= 0; k--) pending.unshift(rest[k]);
    }

    // WRITE PHASE: writes + observer hookups, no interleaved reads.
    for (let j = 0; j < jobs.length; j++) {
      const { el, radius, clamped, corners } = jobs[j];
      write(el, radius);
      ORIG.set(el, corners);  // store BASE radii so recompute is exact
      managed.add(el);        // ...and follow its border-radius from now on
      if (resizeObserver && clamped && !tracked.has(el)) {
        tracked.add(el);
        resizeObserver.observe(el);
      }
    }

    if (pending.length || roots.length) schedule();
  }

  // ---- dynamic border-radius changes (e.g. .accordion-button) -------------
  // A class flip can rewrite an element's authored border-radius. Our inline
  // override masks the stylesheet, so we must re-read the new target and rewrite
  // it ourselves. Elements carry `transition: border-radius` (Bootstrap's
  // accordion does, 400ms), so we hand the animation back to CSS: suppress the
  // transition only long enough to sample the new target and re-seat the old
  // value as the baseline, then release it so the inline change tweens natively.
  function recompute(el) {
    if (!el.isConnected) return;

    const prev = ORIG.get(el);
    const prevBR = el.style.getPropertyValue('border-radius');

    // Reveal the stylesheet's *target* radius: drop our override and freeze the
    // transition so getComputedStyle returns the final value, not a mid-tween one.
    el.style.setProperty('transition', 'none', 'important');
    el.style.removeProperty('border-radius');
    const corners = readCorners(getComputedStyle(el));   // forced flush -> target
    const out = compute(el, corners);
    const next = out.radius;

    ORIG.set(el, corners);

    if (!next) {
      // No rounded corners now. Tween our radius down to 0 (keeping the squircle
      // shape, which is invisible at 0) so the corners shrink in step with the
      // element's own border-radius transition instead of snapping. Stay managed
      // so a later class flip can re-squircle them.
      if (prevBR) {
        el.style.setProperty('border-radius', prevBR, 'important');
        getComputedStyle(el).borderRadius;   // commit baseline
      }
      el.style.removeProperty('transition');
      el.style.setProperty('border-radius', '0px', 'important');
      return;
    }

    if (prev && cornersEqual(prev, corners)) {
      // Authored radius is unchanged (the class flip touched something else):
      // re-seat our frozen value and commit it while transitions are still off,
      // so releasing the transition can't tween from the bare unscaled target.
      if (prevBR) {
        el.style.setProperty('border-radius', prevBR, 'important');
        getComputedStyle(el).borderRadius;   // commit before re-enabling
      }
      el.style.removeProperty('transition');
      return;
    }

    // Re-seat the old (scaled) value as the transition baseline while still
    // frozen, commit it, then release the transition and write the new value so
    // CSS tweens old -> new instead of jumping from the bare target.
    if (prevBR) {
      el.style.setProperty('border-radius', prevBR, 'important');
      getComputedStyle(el).borderRadius;   // commit baseline
    }
    el.style.removeProperty('transition');
    write(el, next);
  }

  // ---- observe the page ---------------------------------------------------
  const observer = new MutationObserver((mutations) => {
    let added = false;
    let dirty = null;
    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i];
      if (m.type === 'attributes') {
        const el = m.target;
        if (managed.has(el)) (dirty || (dirty = new Set())).add(el);
        continue;
      }
      const nodes = m.addedNodes;
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].nodeType === 1) { roots.push(nodes[j]); added = true; }
      }
    }
    if (dirty) dirty.forEach(recompute);
    if (added) schedule();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],   // our own writes touch style, never class
  });

  // Sweep the rendered tree only. <head> (meta/link/script/style/title) never
  // paints a box, so starting at <body> drops a whole batch of pointless
  // getComputedStyle reads. The MutationObserver below still watches the whole
  // document, so anything later added anywhere is still caught.
  const sweep = () => { expand(document.body || document.documentElement); schedule(); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sweep, { once: true });
  } else {
    sweep();
  }
})();
