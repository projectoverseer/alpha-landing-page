(function () {
  function updateNavState() {
    const navbar = document.querySelector('#globalnav');
    if (window.scrollY >= 16) {
      navbar.classList.add('nav-active');
      navbar.setAttribute('data-bs-theme', 'light');
    } else {
      const navbar = document.querySelector('#globalnav');
      navbar.classList.remove('nav-active');
      navbar.setAttribute('data-bs-theme', 'dark');
    }
  }

  updateNavState(); // updates nav state on page load
  window.addEventListener('scroll', updateNavState);

  // Updates URL to remove hash
  function removeHash() {
    history.replaceState('', document.title, window.location.pathname
      + window.location.search);
  }

  window.addEventListener('hashchange', removeHash, false);

  // Removes queries on page load
  if (location.search) {
    const cleanUrl = location.href.split('?')[0];
    history.replaceState(null, '', cleanUrl);
  }

  removeHash();
})();