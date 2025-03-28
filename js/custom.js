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
