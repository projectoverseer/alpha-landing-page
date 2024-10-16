(function() {
  function updateNavState() {
    const navbar = document.querySelector('#globalnav');
    if (window.scrollY > 0) {
      navbar.classList.add('nav-active');
      navbar.setAttribute('data-bs-theme', 'light');
    } else {
      navbar.classList.remove('nav-active');
      navbar.setAttribute('data-bs-theme', 'dark');
    }
  }

  // Debounce function to limit how often updateNavState is called
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      if (window.scrollY < 120) {
        timeout = setTimeout(later, wait);
      } else {
        timeout = setTimeout(later, 0);
      }
    };
  }

  updateNavState(); // updates nav state on page load
  window.addEventListener("scroll", debounce(updateNavState, 100));

  // Prevents hash from changing
  function removeHash() {
    if (window.location.hash) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }

  window.addEventListener("hashchange", removeHash, false);

  // Removes queries on page load
  if (location.search) {
    const cleanUrl = location.href.split('?')[0];
    history.replaceState(null, '', cleanUrl); // Use replaceState instead of pushState
  }

  removeHash();
})();