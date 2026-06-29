function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    // Defer the jump until the tab is actually on screen (these links open BACKGROUNDED).
    // Smooth-glide when motion is allowed, instant when Reduce Motion is on — matching the
    // CSS scroll-behavior so deep links behave like every other in-page anchor.
    whenVisible(function () {
      const smooth = !prefersReducedMotion();

      // If media above the card finishes loading after the jump and shifts layout, re-align
      // to the true position once everything's loaded. Re-issue with the SAME behavior so a
      // smooth glide is retargeted smoothly (an "instant" correction here would snap the page
      // mid-glide — exactly the jolt this used to cause).
      function correctForLayoutShift() {
        target.scrollIntoView({
          behavior: smooth ? "smooth" : "instant",
          block: "start",
        });
      }
      window.addEventListener("load", correctForLayoutShift, { once: true });

      target.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "start",
      });
      removeHash();

      // Light the highlight up front and hold it through the glide; it fades out once the
      // scroll settles (onSettled also drops the load-correction listener).
      flashReview(target, function () {
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
  const navbar = document.getElementById("navbar");
  const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 64;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const scrollOffset = 6.8125 * rootFontSize; // rem offset below the navbar

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

    dropdownEl.addEventListener("mouseenter", () => getDropdown().show());
    dropdownEl.addEventListener("mouseleave", () => getDropdown().hide());
  });

  // Accordion expansion via dropdown item — expand & smooth-scroll
  document.querySelectorAll(".dropdown-item[data-target-accordion]").forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();

      const targetId = this.getAttribute("data-target-accordion");
      const targetEl = document.querySelector(targetId);

      if (!targetEl) return;

      if (!targetEl.classList.contains("show")) {
        new bootstrap.Collapse(targetEl, { toggle: false }).show();
      }

      const top =
        window.scrollY + targetEl.getBoundingClientRect().top - navbarHeight - scrollOffset;

      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });

      const parentDropdownToggle = this.closest(".nav-item.dropdown")
        ?.querySelector(".dropdown-toggle");
      if (parentDropdownToggle) {
        bootstrap.Dropdown.getInstance(parentDropdownToggle)?.hide();
      }
    });
  });
});
