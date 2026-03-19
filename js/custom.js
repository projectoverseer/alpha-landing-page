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

  // Set correct state on page load, then track on scroll
  updateNavState();
  window.addEventListener("scroll", throttle(updateNavState, 200), { passive: true });
  window.addEventListener("hashchange", removeHash, false);

  cleanUrl();
  removeHash();
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

      window.scrollTo({ top, behavior: "smooth" });

      const parentDropdownToggle = this.closest(".nav-item.dropdown")
        ?.querySelector(".dropdown-toggle");
      if (parentDropdownToggle) {
        bootstrap.Dropdown.getInstance(parentDropdownToggle)?.hide();
      }
    });
  });
});
