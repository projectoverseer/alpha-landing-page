(() => {
  'use strict';

  /* ======================================================================== *
   *  kt-lightbox — the hub's picture viewer.
   *
   *  Every figure in an article is an infographic or a lab report: the reader
   *  needs to READ it, and the 632px column is not where a 1344px table of
   *  CIE illuminants is read. Tapping a figure opens it full-screen on a dark
   *  ground at its largest shipped size, with wheel / pinch / tap zoom and
   *  drag pan — the viewer every reader already knows from Facebook, where
   *  these articles were born.
   *
   *  Progressive enhancement, per philosophy §2.6: this file is loaded only on
   *  article pages, and with JS off (or if anything here throws) a figure is
   *  simply a picture. The script wraps each figure's <picture> in a real
   *  <button>, so the affordance is keyboard-reachable and announced.
   *
   *  Closing: ×, Esc, tapping the backdrop — and the BACK button. Readers
   *  arrive from Facebook on Android; on that phone "back" is how everything
   *  closes, and a back-press that leaves the article instead of the picture
   *  loses the reader. One pushState on open, popstate closes.
   * ======================================================================== */

  var figures = document.querySelectorAll('.kt-figure[data-zoom-jpg]');
  if (!figures.length) return;

  // ---- state ----------------------------------------------------------------
  var overlay = null, stage = null, closeBtn = null, captionEl = null, img = null;
  var isOpen = false;
  var opener = null; // the button to hand focus back to on close
  var s = 1, tx = 0, ty = 0; // zoom scale + pan, applied to the image
  var baseW = 0, baseH = 0; // the image's fitted size at s = 1
  var MAX_S = 4;
  var pointers = new Map();
  var pinch = null, drag = null;
  var suppressClick = false; // a drag or pinch must not count as a tap

  // ---- wire every figure ------------------------------------------------------
  figures.forEach(function (fig) {
    var pic = fig.querySelector('picture');
    var srcImg = fig.querySelector('img');
    if (!pic || !srcImg) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kt-figure-zoom';
    btn.setAttribute('aria-label', srcImg.alt ? 'Phóng to hình: ' + srcImg.alt : 'Phóng to hình ảnh');
    fig.insertBefore(btn, pic);
    btn.appendChild(pic);
    btn.addEventListener('click', function () { open(fig, btn); });
  });
  // The buttons exist now, so the stylesheet may show the zoom cursor.
  document.documentElement.classList.add('kt-lightbox-on');

  // ---- overlay, built once on first open --------------------------------------
  function build() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'kt-lightbox';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Xem hình ảnh');

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'kt-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Đóng');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
      '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    closeBtn.addEventListener('click', function () { close(false); });

    stage = document.createElement('div');
    stage.className = 'kt-lightbox-stage';

    captionEl = document.createElement('p');
    captionEl.className = 'kt-lightbox-caption';
    captionEl.hidden = true;

    overlay.appendChild(closeBtn);
    overlay.appendChild(stage);
    overlay.appendChild(captionEl);
    document.body.appendChild(overlay);

    // -- gestures (Pointer Events unify mouse / touch / pen) --
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('click', onClick);
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(false); }
      // The dialog has one focusable control; Tab always lands on it.
      if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); }
    });
    window.addEventListener('popstate', function () { if (isOpen) close(true); });
    window.addEventListener('resize', function () { if (isOpen) { measure(); reset(false); } });
  }

  // ---- open / close ------------------------------------------------------------
  function open(fig, btn) {
    build();
    opener = btn;

    stage.textContent = '';
    var pic = document.createElement('picture');
    if (fig.dataset.zoomAvif) {
      var source = document.createElement('source');
      source.type = 'image/avif';
      source.srcset = fig.dataset.zoomAvif;
      pic.appendChild(source);
    }
    img = document.createElement('img');
    img.src = fig.dataset.zoomJpg;
    img.width = +fig.dataset.zoomW || 0;
    img.height = +fig.dataset.zoomH || 0;
    var figImg = fig.querySelector('img');
    img.alt = figImg ? figImg.alt : '';
    img.decoding = 'async';
    img.draggable = false;
    img.addEventListener('load', function () { if (isOpen) measure(); });
    pic.appendChild(img);
    stage.appendChild(pic);

    var figcap = fig.querySelector('figcaption');
    captionEl.textContent = figcap ? figcap.textContent : '';
    captionEl.hidden = !figcap;

    isOpen = true;
    overlay.hidden = false;
    document.body.classList.add('kt-lightbox-open');
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      measure();
      reset(false);
    });
    closeBtn.focus();
    history.pushState({ ktLightbox: true }, '');
  }

  function close(fromPopstate) {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('is-open');
    document.body.classList.remove('kt-lightbox-open');
    pointers.clear();
    pinch = drag = null;
    setTimeout(function () {
      if (!isOpen) { overlay.hidden = true; stage.textContent = ''; img = null; }
    }, 220); // just past the fade; with reduced motion it is already invisible
    if (opener) opener.focus();
    // Consume the state pushed on open, unless the Back button already did.
    if (!fromPopstate && history.state && history.state.ktLightbox) history.back();
  }

  // ---- geometry ------------------------------------------------------------------
  // The transform is translate(tx, ty) scale(s) about the image's center, so a
  // point u (from the center) renders at t + s·u. Keeping the point under the
  // cursor fixed across a zoom from s to s2 gives t2 = c − (s2/s)(c − t).
  function relPoint(clientX, clientY) {
    var r = stage.getBoundingClientRect();
    return { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 };
  }

  function measure() {
    if (!img) return;
    var r = img.getBoundingClientRect();
    if (r.width) { baseW = r.width / s; baseH = r.height / s; }
  }

  function clampPan() {
    var r = stage.getBoundingClientRect();
    var mx = Math.max(0, (baseW * s - r.width) / 2);
    var my = Math.max(0, (baseH * s - r.height) / 2);
    tx = Math.min(mx, Math.max(-mx, tx));
    ty = Math.min(my, Math.max(-my, ty));
  }

  function apply(animate) {
    if (!img) return;
    if (animate) {
      img.classList.add('kt-anim');
      setTimeout(function () { if (img) img.classList.remove('kt-anim'); }, 320);
    }
    img.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(' + s + ')';
    stage.classList.toggle('is-zoomed', s > 1.001);
  }

  function zoomTo(s2, p, animate) {
    s2 = Math.min(MAX_S, Math.max(1, s2));
    var k = s2 / s;
    tx = p.x - k * (p.x - tx);
    ty = p.y - k * (p.y - ty);
    s = s2;
    if (s <= 1.001) { s = 1; tx = 0; ty = 0; }
    clampPan();
    apply(animate);
  }

  function reset(animate) {
    s = 1; tx = 0; ty = 0;
    apply(animate);
  }

  // ---- gestures -------------------------------------------------------------------
  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinch = {
        d0: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
        mid0: relPoint((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2),
        s0: s,
        tx0: tx,
        ty0: ty,
      };
      drag = null;
      suppressClick = true;
    } else if (pointers.size === 1) {
      drag = { x: e.clientX, y: e.clientY, tx0: tx, ty0: ty };
    }
  }

  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size >= 2) {
      var pts = Array.from(pointers.values());
      var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      var mid = relPoint((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
      var s2 = Math.min(MAX_S, Math.max(1, pinch.s0 * (d / pinch.d0)));
      var k = s2 / pinch.s0;
      // Same fixed-point formula, anchored on the pinch midpoint — moving both
      // fingers together therefore pans, exactly as the hand expects.
      tx = mid.x - k * (pinch.mid0.x - pinch.tx0);
      ty = mid.y - k * (pinch.mid0.y - pinch.ty0);
      s = s2;
      clampPan();
      apply(false);
    } else if (drag) {
      var dx = e.clientX - drag.x;
      var dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 6) suppressClick = true;
      if (s > 1) {
        tx = drag.tx0 + dx;
        ty = drag.ty0 + dy;
        clampPan();
        apply(false);
      }
    }
  }

  function onUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!pointers.size) drag = null;
  }

  function onClick(e) {
    if (suppressClick) { suppressClick = false; return; }
    // A tap on the picture toggles zoom at that point; a tap beside it closes.
    if (img && (e.target === img || img.contains(e.target))) {
      if (s > 1) reset(true);
      else zoomTo(2.5, relPoint(e.clientX, e.clientY), true);
    } else {
      close(false);
    }
  }

  function onWheel(e) {
    e.preventDefault(); // the page must not scroll behind the viewer
    zoomTo(s * Math.exp(-e.deltaY * 0.0015), relPoint(e.clientX, e.clientY), false);
  }
})();
