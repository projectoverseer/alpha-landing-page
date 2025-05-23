(function () {
  const navbar = document.getElementById("muc-luc");

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

  const throttledUpdateNavState = throttle(updateNavState, 200);

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

  // Initial call to set the correct state on page load
  updateNavState();

  window.addEventListener("scroll", throttledUpdateNavState, { passive: true });
  window.addEventListener("hashchange", removeHash, false);

  cleanUrl();
  removeHash();
})();

function copyEmailToClipboard(element, feedbackMessage) {
  // Get the email address from the href attribute.
  // This is generally more reliable than textContent if the displayed text might differ.
  const emailToCopy = element.href.replace("mailto:", "");

  // Attempt to use the modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(emailToCopy)
      .then(() => {
        // Provide temporary user feedback on the element itself
        const originalText = element.textContent;
        setTimeout(() => {
          element.textContent = feedbackMessage;
          setTimeout(() => {
            element.textContent = originalText;
          }, 2000); // Revert to original text after 2 seconds
        }, 200); // If redirect action succeeds, there is no need to show this feedback
      })
      .catch(() => {
        // Fallback if Clipboard API fails (e.g., permissions, specific browser contexts)
        fallbackCopyTextToClipboard(emailToCopy, element);
      });
  } else {
    // Fallback for browsers that do not support the Clipboard API
    fallbackCopyTextToClipboard(emailToCopy, element, feedbackMessage);
  }
}

// Fallback function for older browsers that don't support Clipboard API
function fallbackCopyTextToClipboard(text, element, feedbackMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.position = "fixed"; // Ensures it's not part of flow
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0"; // Make it invisible
  textArea.style.pointerEvents = "none"; // Ensure it doesn't interfere with clicks

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    // Provide temporary user feedback on the element itself
    const originalText = element.textContent;
    element.textContent = feedbackMessage;
    setTimeout(() => {
      element.textContent = originalText;
    }, 2000); // Revert after 2 seconds
  } catch {}

  document.body.removeChild(textArea);
}

document.addEventListener("DOMContentLoaded", function () {
  const NAVBAR_HEIGHT = 64; // Your fixed navbar height in pixels
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  const REM_OFFSET = 6.8125 * rootFontSize; // Convert rem to pixels

  // --- Scalable Dropdown Hover Logic ---
  const allDropdowns = document.querySelectorAll(".nav-item.dropdown"); // Selects all dropdowns

  allDropdowns.forEach((dropdownEl) => {
    // Loop through each dropdown found
    const dropdownToggle = dropdownEl.querySelector(".dropdown-toggle");
    let bsDropdownInstance = null; // This variable will hold the Bootstrap Dropdown object for *this specific dropdown*

    // Helper function to get or create the Bootstrap Dropdown instance for the current dropdown
    function getBsDropdown() {
      if (!bsDropdownInstance) {
        bsDropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
        if (!bsDropdownInstance) {
          // If no instance exists yet, create a new one
          bsDropdownInstance = new bootstrap.Dropdown(dropdownToggle);
        }
      }
      return bsDropdownInstance;
    }

    // Show dropdown on mouse enter for this specific dropdown
    dropdownEl.addEventListener("mouseenter", function () {
      getBsDropdown().show();
    });

    // Hide dropdown on mouse leave for this specific dropdown
    dropdownEl.addEventListener("mouseleave", function () {
      getBsDropdown().hide();
    });
  });
  // --- End Scalable Dropdown Hover Logic ---

  // --- Accordion Expansion & Scroll Logic (Existing code) ---
  const dropdownItems = document.querySelectorAll(
    ".dropdown-item[data-target-accordion]",
  );

  dropdownItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();

      const targetAccordionId = this.getAttribute("data-target-accordion");
      const targetAccordionElement = document.querySelector(targetAccordionId);

      if (targetAccordionElement) {
        // Only expand if it's currently collapsed
        if (!targetAccordionElement.classList.contains("show")) {
          const bsCollapse = new bootstrap.Collapse(targetAccordionElement, {
            toggle: false,
          });
          bsCollapse.show();
        }

        // --- Custom Scroll Offset Logic ---
        const elementRect = targetAccordionElement.getBoundingClientRect();
        const scrollPosition =
          window.scrollY + elementRect.top - NAVBAR_HEIGHT - REM_OFFSET;

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
        // --- End Custom Scroll Offset Logic ---

        // Hide the SPECIFIC parent dropdown after clicking an item
        const parentDropdownLi = this.closest(".nav-item.dropdown"); // Find the closest parent dropdown
        if (parentDropdownLi) {
          const parentDropdownToggle =
            parentDropdownLi.querySelector(".dropdown-toggle");
          const bsDropdown =
            bootstrap.Dropdown.getInstance(parentDropdownToggle); // Get its existing instance
          if (bsDropdown) {
            bsDropdown.hide(); // Hide that specific dropdown
          }
        }
      }
    });
  });
  // --- End Accordion Expansion & Scroll Logic ---
});
