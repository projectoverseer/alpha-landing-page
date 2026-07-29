function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─── A LINK THAT NAMES A PRODUCT MUST ARRIVE AT THAT PRODUCT, OPEN ───
//
// The reading hub's card CTA says "Tìm hiểu Alpha Smart Dyehouse" and used to
// land on /#san-pham — the section — which put the reader in front of two closed
// headers and left them to guess which one the button had meant (owner,
// 2026-07-29). The fragment names the product's own header now, and the panel it
// controls opens as the page arrives.
//
// The fragment is the HEADER's id, never the panel's, and that is what makes the
// no-JS behaviour right on its own: the browser jumps to the heading that names
// the product, which is where the reader wanted to be — the panel is simply
// still closed, one tap away. JS adds the opening, not the address. (A panel id
// is accepted too; it is a reasonable thing for someone to link to and there is
// no reason to punish it.)
//
// These two live at file scope because there are TWO ways to ask for a product —
// a deep link and the navbar's Các sản phẩm menu — and both must land the reader
// in the same place. They used to be two separate pieces of code with two
// different landings: the menu scrolled the PANEL into view behind a 6.8125rem
// magic number computed in JS, a deep link scrolled the HEADER behind its CSS
// scroll-margin. Now the offset is stated once, in CSS, where every other anchor
// landing on the site already states it.
function accordionFor(el) {
  if (!el) return null;

  // The header, or anything inside it — the <h3>, the <button>, a <span>.
  const header = el.closest(".accordion-header");
  if (header) {
    const button = header.querySelector('[data-bs-toggle="collapse"]');
    const panel = button && document.querySelector(button.getAttribute("data-bs-target"));
    return panel ? { panel, header } : null;
  }

  // The panel itself. Its `aria-labelledby` points back at the header, which is
  // where the scroll should land — landing on the panel would park the heading
  // that names it just above the top of the viewport.
  if (el.classList.contains("accordion-collapse")) {
    const owner = document.getElementById(el.getAttribute("aria-labelledby"));
    return { panel: el, header: owner || el };
  }

  return null;
}

// `toggle: false` so constructing the instance does not itself flip the panel;
// getOrCreateInstance so a panel the reader has already touched keeps its own.
// Bootstrap updates the trigger's .collapsed / aria-expanded from here, so the
// chevron and the accessibility tree follow without being told twice.
function openAccordion(entry) {
  if (entry && !entry.panel.classList.contains("show")) {
    bootstrap.Collapse.getOrCreateInstance(entry.panel, { toggle: false }).show();
  }
}

(function () {
  const navbar = document.getElementById("navbar");

  function throttle(func, wait) {
    let timeout;
    let previous = 0;

    return function executedFunction(...args) {
      const now = Date.now();
      const remaining = wait - (now - previous);

      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        func(...args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func(...args);
        }, remaining);
      }
    };
  }

  function updateNavState() {
    if (window.scrollY > 0) {
      navbar.classList.add("nav-active");
      navbar.setAttribute("data-bs-theme", "light");
    } else {
      navbar.classList.remove("nav-active");
      navbar.setAttribute("data-bs-theme", "dark");
    }
  }

  function removeHash() {
    history.replaceState(
      "",
      document.title,
      window.location.pathname + window.location.search,
    );
  }

  function cleanUrl() {
    if (location.search) {
      history.replaceState(null, "", location.pathname);
    }
  }

  // Hold a soft "here it is" highlight on the landed review. The tint goes on UP FRONT — so
  // the card is already lit while the page glides toward it, with no white gap — and only
  // comes off once the scroll actually SETTLES, at which point CSS fades it out. Removal is
  // timed to arrival via the `scrollend` event (the browser's authoritative "the glide has
  // stopped" signal), not a fixed delay, so the hold spans however long the glide takes —
  // whatever the distance, browser, or Reduce-Motion setting. (Sampling scrollY deltas to
  // detect arrival is unreliable: a mid-glide frame drop / compositor desync makes two reads
  // identical, reading as "settled" early.) `onSettled` fires first so the caller can drop
  // its late-layout correction before we let go. Cleared so a later deep-link re-triggers it.
  function flashReview(target, onSettled) {
    target.classList.add("is-flashing"); // lit immediately; CSS holds the tint

    // Where the card rests with block:"start": its top sits scroll-margin-top below the
    // scrollport. Reading now is safe — a smooth scroll hasn't shifted layout yet.
    const restingTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    function distanceToRest() {
      return Math.abs(target.getBoundingClientRect().top - restingTop);
    }
    // Already parked (instant jump, Reduce Motion, or a tab the browser pre-scrolled) ⇒
    // nothing will move ⇒ no scrollend will ever come.
    const expectMotion = distanceToRest() > 4;
    const start = performance.now();
    let done = false;
    let idleTimer;
    let capTimer;

    function settle() {
      if (done) return;
      done = true;
      document.removeEventListener("scrollend", settle);
      clearTimeout(idleTimer);
      clearTimeout(capTimer);
      if (onSettled) onSettled();
      // Hold a beat at full strength once arrived, then swap the held tint for the settle
      // animation (CSS fades it out). Drop .is-settling after the fade so a later deep-link
      // can re-trigger the whole cue cleanly.
      setTimeout(function () {
        target.classList.remove("is-flashing");
        target.classList.add("is-settling");
        setTimeout(function () {
          target.classList.remove("is-settling");
        }, 1200);
      }, 500);
    }

    if ("onscrollend" in window) {
      document.addEventListener("scrollend", settle);
      // Safety net in case scrollend is missed; if nothing's pending, a short idle stands in
      // for the scrollend that won't fire.
      capTimer = setTimeout(settle, 2500);
      if (!expectMotion) idleTimer = setTimeout(settle, 140);
      return;
    }

    // Fallback (browsers without scrollend): poll GEOMETRY — distance to the resting spot —
    // not velocity, so a mid-glide flatline can't trip it. Fade once the card is parked.
    (function poll() {
      if (done) return;
      const elapsed = performance.now() - start;
      if ((distanceToRest() <= 6 && elapsed > 80) || elapsed > 2500) {
        settle();
        return;
      }
      requestAnimationFrame(poll);
    })();
  }

  // Run a step now if the tab is visible, otherwise the first time it becomes
  // visible. These "open original in a new tab" links frequently open BACKGROUNDED,
  // and a backgrounded tab neither fires requestAnimationFrame nor paints a CSS
  // animation — so the flash must wait until the user actually looks at the tab.
  function whenVisible(fn) {
    if (document.visibilityState === "visible") {
      fn();
    } else {
      document.addEventListener("visibilitychange", function onShow() {
        if (document.visibilityState === "visible") {
          document.removeEventListener("visibilitychange", onShow);
          fn();
        }
      });
    }
  }

  // On load, honor a deep-link fragment (e.g. /#review-…) BEFORE stripping it.
  // The browser's own jump-to-fragment races with removeHash() and loses (the hash
  // is gone before layout settles), so do the jump ourselves, then clean the URL to
  // match the hash-free convention used elsewhere. scrollIntoView honors the target's
  // scroll-margin-top, so it clears the fixed bar. No requestAnimationFrame at the top
  // level: it can silently never fire in a backgrounded _blank tab, taking the scroll
  // with it — so the whole jump waits behind the visibility gate.
  function jumpToInitialHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && document.getElementById(id);

    if (!target) {
      removeHash();
      return;
    }

    // If the fragment names a product, open it BEFORE anything scrolls. The panel
    // grows downward, below the header we are landing on, so opening first costs
    // the glide nothing and spares the reader a second movement on arrival.
    const accordion = accordionFor(target);
    const landing = accordion ? accordion.header : target;

    // Defer the jump until the tab is actually on screen (these links open BACKGROUNDED).
    // Smooth-glide when motion is allowed, instant when Reduce Motion is on — matching the
    // CSS scroll-behavior so deep links behave like every other in-page anchor.
    whenVisible(function () {
      const smooth = !prefersReducedMotion();
      openAccordion(accordion);

      // If media above the card finishes loading after the jump and shifts layout, re-align
      // to the true position once everything's loaded. Re-issue with the SAME behavior so a
      // smooth glide is retargeted smoothly (an "instant" correction here would snap the page
      // mid-glide — exactly the jolt this used to cause).
      function correctForLayoutShift() {
        landing.scrollIntoView({
          behavior: smooth ? "smooth" : "instant",
          block: "start",
        });
      }
      window.addEventListener("load", correctForLayoutShift, { once: true });

      landing.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "start",
      });
      removeHash();

      // Light the highlight up front and hold it through the glide; it fades out once the
      // scroll settles (onSettled also drops the load-correction listener). The cue itself
      // is a review-card style, so on a product header this only carries the timing — the
      // panel opening IS that landing's "here it is".
      flashReview(landing, function () {
        window.removeEventListener("load", correctForLayoutShift);
      });
    });
  }

  // Set correct state on page load, then track on scroll
  updateNavState();
  window.addEventListener("scroll", throttle(updateNavState, 200), { passive: true });
  window.addEventListener("hashchange", removeHash, false);

  cleanUrl();
  jumpToInitialHash();
})();

function copyEmailToClipboard(element, feedbackMessage) {
  const emailToCopy = element.href.replace("mailto:", "");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(emailToCopy)
      .then(() => {
        const originalText = element.textContent;
        // Short delay so the browser's mailto action resolves first;
        // if it navigates away this feedback is never shown.
        setTimeout(() => {
          element.textContent = feedbackMessage;
          setTimeout(() => {
            element.textContent = originalText;
          }, 2000);
        }, 200);
      })
      .catch(() => {
        fallbackCopyTextToClipboard(emailToCopy, element, feedbackMessage);
      });
  } else {
    fallbackCopyTextToClipboard(emailToCopy, element, feedbackMessage);
  }
}

function fallbackCopyTextToClipboard(text, element, feedbackMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    const originalText = element.textContent;
    element.textContent = feedbackMessage;
    setTimeout(() => {
      element.textContent = originalText;
    }, 2000);
  } catch (_) {
    // Copy not supported in this context — fail silently
  }

  document.body.removeChild(textArea);
}

document.addEventListener("DOMContentLoaded", function () {
  // Dropdown hover — open on mouseenter, close on mouseleave
  document.querySelectorAll(".nav-item.dropdown").forEach((dropdownEl) => {
    const dropdownToggle = dropdownEl.querySelector(".dropdown-toggle");
    let bsDropdown = null;

    function getDropdown() {
      if (!bsDropdown) {
        bsDropdown =
          bootstrap.Dropdown.getInstance(dropdownToggle) ||
          new bootstrap.Dropdown(dropdownToggle);
      }
      return bsDropdown;
    }

    dropdownEl.addEventListener("mouseenter", () => {
      // Bootstrap's Dropdown.show() force-focuses the toggle. On a hover open that
      // scripted focus is unwanted: right after F12 or a navigation the browser's
      // :focus-visible heuristic is in "keyboard" mode, so it paints the focus ring
      // on mere hover. Drop the focus we didn't ask for — but only if the user wasn't
      // already keyboard-focused here, so genuine keyboard focus is preserved.
      const hadFocus = document.activeElement === dropdownToggle;
      getDropdown().show();
      if (!hadFocus) dropdownToggle.blur();
    });
    dropdownEl.addEventListener("mouseleave", () => getDropdown().hide());
  });

  // Accordion expansion via dropdown item — expand & smooth-scroll.
  //
  // Exactly the two steps a /#alpha-smart-dyehouse deep link takes, in the same
  // order, landing on the same element: open the panel, scroll to the HEADER
  // that names it. It used to scroll to the panel behind an offset assembled
  // here from the measured bar height plus 6.8125rem — a number nothing else on
  // the site knew about — so the menu and a link from the reading hub put the
  // reader in two different places for the same destination. scrollIntoView
  // honours `.accordion-header[id] { scroll-margin-top }` instead, which is
  // where every other anchor landing on this site states its offset.
  document.querySelectorAll(".dropdown-item[data-target-accordion]").forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();

      const entry = accordionFor(
        document.querySelector(this.getAttribute("data-target-accordion")),
      );

      if (!entry) return;

      openAccordion(entry);
      entry.header.scrollIntoView({
        // "instant", not "auto": `auto` defers to the element's computed
        // scroll-behavior, which Bootstrap's reboot sets to `smooth`. It happens
        // to resolve correctly today — reboot scopes that rule to
        // `prefers-reduced-motion: no-preference` — but it means a reader who
        // asked for no motion is relying on a media query in someone else's
        // stylesheet. Say what is meant, as jumpToInitialHash already does.
        behavior: prefersReducedMotion() ? "instant" : "smooth",
        block: "start",
      });

      const parentDropdownToggle = this.closest(".nav-item.dropdown")
        ?.querySelector(".dropdown-toggle");
      if (parentDropdownToggle) {
        bootstrap.Dropdown.getInstance(parentDropdownToggle)?.hide();
      }
    });
  });
});
