const navbar = document.querySelector("#mainNav");
window.onscroll = () => {
  if (window.scrollY > 2) {
    navbar.classList.add("nav-active");
  } else {
    navbar.classList.remove("nav-active");
  }
};
