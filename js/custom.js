const navbar = document.querySelector('#globalnav')
window.onscroll = () => {
  if (window.scrollY > 0) {
    navbar.classList.add('nav-active')
    navbar.setAttribute('data-bs-theme', 'light')
  } else {
    navbar.classList.remove('nav-active')
    navbar.setAttribute('data-bs-theme', 'dark')
  }
}


// Prevents hash from changing
function removeHash() {
  history.pushState('', document.title, window.location.pathname
    + window.location.search);
}

window.addEventListener(
  "hashchange",
  () => {
    removeHash()
  }, false
)

// Removes queries on page load
history.pushState(null, '', location.href.split('?')[0])
removeHash()