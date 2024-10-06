const navbar = document.querySelector('#mainNav');
window.onscroll = () => {
  if (window.scrollY > 0) {
    navbar.classList.add('nav-active')
  } else {
    navbar.classList.remove('nav-active')
  }
};