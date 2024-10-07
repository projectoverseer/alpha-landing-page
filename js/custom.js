const navbar = document.querySelector('#globalnav');
window.onscroll = () => {
  if (window.scrollY > 0) {
    navbar.classList.add('nav-active')
  } else {
    navbar.classList.remove('nav-active')
  }
};