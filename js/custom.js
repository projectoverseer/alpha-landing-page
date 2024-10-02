const navbar = document.querySelector('#mainNav');
window.onscroll = () => {
  if (window.scrollY > 3) {
    navbar.classList.add('nav-active')
  } else {
    navbar.classList.remove('nav-active')
  }
};

function removeHash() { 
  history.pushState('', document.title, window.location.pathname + window.location.search)
}

addEventListener("popstate", (event) => {
  removeHash()
});