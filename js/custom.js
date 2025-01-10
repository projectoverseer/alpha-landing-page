(function () {
  const navbar = document.querySelector('#globalnav');

  function updateNavState() {
    if (window.scrollY > 12) {
      navbar.classList.add('nav-active');
      navbar.setAttribute('data-bs-theme', 'light');
    } else {
      navbar.classList.remove('nav-active');
      navbar.setAttribute('data-bs-theme', 'dark');
    }
  }

  function removeHash() {
    history.replaceState('', document.title, window.location.pathname + window.location.search);
  }

  function cleanUrl() {
    if (location.search) {
      const cleanUrl = location.href.split('?')[0];
      history.replaceState(null, '', cleanUrl);
    }
  }

  updateNavState(); // updates nav state on page load
  window.addEventListener('scroll', updateNavState);
  window.addEventListener('hashchange', removeHash, false);

  cleanUrl();
  removeHash();
})();