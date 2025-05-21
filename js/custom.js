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

  const throttledUpdateNavState = throttle(updateNavState, 377); // assumes average input lag of 23ms

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
        element.textContent = feedbackMessage;
        setTimeout(() => {
          element.textContent = originalText;
        }, 2000); // Revert after 2 seconds
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
