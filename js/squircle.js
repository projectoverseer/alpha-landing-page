(() => {
  'use strict';

  /* ======================================================================== *
   *  Squircle engine — CSS `corner-shape` edition.
   *
   *  Reshapes every rounded corner from a circular arc into a superellipse,
   *  via `corner-shape: superellipse(K)`, keeping native antialiasing,
   *  borders, backgrounds and transitions intact. The goal is neutrality:
   *  the reader should see the button label or the image, never the box
   *  around them.
   *
   *  WHY A SUPERELLIPSE READS AS "NO CORNER". A circular border-radius joins
   *  the straight edge with a curvature jump (0 to 1/r at the tangent point);
   *  the eye picks that point up as "here the corner starts". A superellipse
   *  with exponent n > 2 meets the edges with zero curvature, so the bend
   *  fades in gradually and nothing marks where it begins.
   *
   *  DEPTH IS THE INVARIANT. What registers as "how rounded" is the 45°
   *  depth of the corner cut. Every corner drawn here keeps the exact depth
   *  of the authored circular radius:
   *
   *      depth(r, n) = r * sqrt(2) * (1 - 2^(-1/n))
   *
   *  so a superellipse needs its radius enlarged to s*r to match the circle
   *  of radius r, with  s(n) = (1 - 2^(-1/2)) / (1 - 2^(-1/n)).
   *
   *  ADAPTIVE SMOOTHING. One fixed exponent cannot serve every element: at
   *  the ceiling n = phi^3 (the golden ratio cubed, a gentle superellipse
   *  just past the n = 4 "squircle" sweet spot) the depth-matched radius is
   *  ~1.94x the authored one, which outgrows small elements — a 44px-tall
   *  button with a 12px radius has no room for a 23px corner, and clamping
   *  the radius per axis (the old approach) made exactly those corners
   *  shallow and slightly lopsided. So the exponent adapts per element:
   *  invert s(n) for the radius scale that actually fits,
   *
   *      s = min(SCALE, headroom)          headroom = half-side / max radius
   *      n = -1 / log2(1 - DEPTH / s)      (s = SCALE -> phi^3 ... s = 1 -> 2)
   *
   *  Elements with room get the full golden smoothing; tight ones slide
   *  continuously down toward the plain authored circle (n = 2, which is
   *  rendered identically to no intervention). Depth is never sacrificed
   *  and no corner is ever distorted; only the length of the blend varies.
   *  Because n is a continuous function of size, resizing never "pops".
   *
   *  SAFE FALLBACK. On any browser without `corner-shape: superellipse()`
   *  (everything before Chromium 139) the script returns immediately and
   *  never touches a single style — every element keeps its original,
   *  unmodified border-radius.
   * ======================================================================== */

  // ---- precomputed constants ----------------------------------------------
  const SCALE = 1.9404128895326194;  // depth-match radius scale at n = phi^3
  const DEPTH = 1 - Math.SQRT1_2;    // circle depth coefficient, ~0.2928932
  const ROUND_EPS = 1.01;            // <=1% headroom: keep the native circle
  const SLICE_MAX_NODES = 1500;      // elements measured per idle slice

  // Tags that never paint a rounded box: skip them BEFORE the (costly)
  // getComputedStyle read instead of measuring then discarding. This only trims
  // work — every element that can actually show a corner is still measured, so
  // the squircle shape is applied exactly as before. (SVG/MathML nodes are
  // already skipped by the `instanceof HTMLElement` gate in the read phase.)
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'BR', 'WBR']);

  // ---- capability gate ----------------------------------------------------
  // The tunable superellipse() function lands with `corner-shape` in Chromium
  // 139+. Anywhere else: do nothing, cleanly, leaving the authored
  // border-radius exactly as the stylesheet set it.
  if (!(window.CSS && CSS.supports && CSS.supports('corner-shape', 'superellipse(2.0827)'))) return;

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
          if (out.kind === 'shape') write(el, out);
          else if (out.kind === 'native') release(el);
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

  // Decide what an element's corners should be. Returns one of:
  //   { kind: 'skip' }    no rounded corners authored — nothing to do
  //   { kind: 'native' }  rounded, but no headroom (circle/pill): the browser's
  //                       own rendering is already the right answer
  //   { kind: 'shape', radius, shape, constrained }
  //
  // The scale s is uniform across all four corners (and both axes), so the
  // authored proportions between corners are preserved exactly — the fitting
  // never introduces ellipticity or asymmetry the stylesheet didn't ask for.
  function compute(el, corners) {
    const fitH = el.offsetWidth / 2;
    const fitV = el.offsetHeight / 2;
    const laidOut = fitH > 0 && fitV > 0;

    let maxRh = 0, maxRv = 0;
    for (let i = 0; i < 4; i++) {
      if (corners[i][0] > maxRh) maxRh = corners[i][0];
      if (corners[i][1] > maxRv) maxRv = corners[i][1];
    }
    if (maxRh === 0 && maxRv === 0) return { kind: 'skip' };

    // Headroom: how far the largest radius could grow before a corner box
    // passes half a side (past that the browser starts shrinking radii, and
    // at 1x the element is already a circle/pill — which a superellipse can
    // never improve on, so leave it perfectly round).
    const room = laidOut
      ? Math.min(maxRh > 0 ? fitH / maxRh : Infinity, maxRv > 0 ? fitV / maxRv : Infinity)
      : Infinity;
    if (room <= ROUND_EPS) return { kind: 'native' };

    // Fit the smoothing to the room: full golden-ratio blend when it fits,
    // continuously gentler when it doesn't. Depth stays authored throughout.
    const s = Math.min(SCALE, room);
    const n = -1 / Math.log2(1 - DEPTH / s);
    const shape = 'superellipse(' + Math.log2(n).toFixed(4) + ')';

    const capH = laidOut ? fitH : Infinity;
    const capV = laidOut ? fitV : Infinity;
    let elliptical = false;
    const H = new Array(4), V = new Array(4);
    for (let i = 0; i < 4; i++) {
      const sh = Math.min(corners[i][0] * s, capH);  // caps only absorb float error
      const sv = Math.min(corners[i][1] * s, capV);
      if (Math.abs(sh - sv) > 0.01) elliptical = true;
      H[i] = sh; V[i] = sv;
    }

    const f = (x) => x.toFixed(2) + 'px';
    const radius = elliptical
      ? H.map(f).join(' ') + ' / ' + V.map(f).join(' ')
      : H.map(f).join(' ');
    // Constrained (or not yet laid out) elements depend on their size: watch
    // them so the blend re-fits as room appears or disappears.
    return { kind: 'shape', radius, shape, constrained: !laidOut || s < SCALE - 0.001 };
  }

  function write(el, out) {
    el.style.setProperty('corner-shape', out.shape, 'important');
    el.style.setProperty('border-radius', out.radius, 'important');
  }

  // Hand the corners back to the browser (circle/pill territory).
  function release(el) {
    el.style.removeProperty('corner-shape');
    el.style.removeProperty('border-radius');
  }

  function observeResize(el) {
    if (resizeObserver && !tracked.has(el)) {
      tracked.add(el);
      resizeObserver.observe(el);
    }
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
      if (out.kind !== 'shape') continue;
      jobs.push({ el, out, corners });
    }

    if (i < chunk.length) {
      const rest = chunk.slice(i);
      for (let k = rest.length - 1; k >= 0; k--) pending.unshift(rest[k]);
    }

    // WRITE PHASE: writes + observer hookups, no interleaved reads.
    for (let j = 0; j < jobs.length; j++) {
      const { el, out, corners } = jobs[j];
      write(el, out);
      ORIG.set(el, corners);  // store BASE radii so recompute is exact
      managed.add(el);        // ...and follow its border-radius from now on
      if (out.constrained) observeResize(el);
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

    const prevBR = el.style.getPropertyValue('border-radius');
    const prevShape = el.style.getPropertyValue('corner-shape');

    // Reveal the stylesheet's *target* radius: drop our override and freeze the
    // transition so getComputedStyle returns the final value, not a mid-tween one.
    el.style.setProperty('transition', 'none', 'important');
    el.style.removeProperty('border-radius');
    const corners = readCorners(getComputedStyle(el));   // forced flush -> target
    const out = compute(el, corners);

    ORIG.set(el, corners);

    if (out.kind === 'skip') {
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

    if (out.kind === 'native') {
      // Circle/pill territory now: give the corners back to the browser, but
      // tween there from our old value rather than snapping.
      if (prevBR) {
        el.style.setProperty('border-radius', prevBR, 'important');
        getComputedStyle(el).borderRadius;   // commit baseline
      }
      el.style.removeProperty('transition');
      release(el);
      return;
    }

    if (out.radius === prevBR && out.shape === prevShape) {
      // Same output as before (the class flip touched something else):
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
    write(el, out);
    if (out.constrained) observeResize(el);
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
