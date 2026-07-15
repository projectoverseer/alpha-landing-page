(() => {
  'use strict';

  /* ======================================================================== *
   *  kt-topbar — the scroll title.
   *
   *  Once the page's h1 has scrolled away under the title bar, the bar stops
   *  saying "Chia sẻ kinh nghiệm" and starts saying which COLLECTION the
   *  reader is in — the h1's own text, crossfaded into the name's place (the
   *  owner's model case: Facebook's profile page, where the section bar turns
   *  into the profile's name). Scroll back up and the name returns the same way.
   *
   *  This only ever runs on the collection pages (chủ đề, series, tác giả),
   *  which head.html marks by loading the script AND by setting
   *  data-kt-title-href on the bar. Those h1s name a collection, like an album
   *  name, so the title is a link: clicking an album name takes you to the top
   *  of the album. The click scrolls this page back to the top instead of
   *  reloading it; the href stays real for middle-click / copy. Articles name
   *  one piece, not a collection the bar can point back to, so they neither
   *  load this script nor carry the attribute — no href, and the guard below
   *  bails without touching the lockup.
   *
   *  Progressive enhancement (philosophy §2.6): with JS off — or on any page
   *  without the attribute — nothing here runs and the bar simply keeps the
   *  lockup. The title is created here, not in the HTML, and carries
   *  aria-hidden: it repeats what the h1 already announces, so assistive tech
   *  should hear it once.
   *
   *  The threshold is the h1's LAST line passing under the bar, not its
   *  first: while any part of the headline still shows, naming it again an
   *  inch above would be noise. IntersectionObserver with the viewport's top
   *  inset by the bar's height gives exactly that edge, and costs nothing on
   *  scroll. The boundingClientRect check tells "gone above" from "not yet
   *  reached" — only the former earns the title.
   * ======================================================================== */

  var bar = document.querySelector('.kt-topbar');
  var href = bar && bar.getAttribute('data-kt-title-href');
  var swap = document.querySelector('.kt-brand-swap');
  var h1 = document.querySelector('main h1:not(.kt-visually-hidden)');
  if (!bar || !href || !swap || !h1 || !('IntersectionObserver' in window)) return;

  // The title is always a link: the only pages that reach here are collections,
  // and a collection name is a way back to the top of the collection.
  var title = document.createElement('a');
  title.className = 'kt-bar-title';
  title.href = href;
  // aria-hidden: the title repeats what the page's h1 already announces, so
  // assistive tech should hear it once — and an aria-hidden element must not
  // take focus, so it also leaves the tab order. It is a pointer convenience;
  // keyboards already have Home.
  title.setAttribute('aria-hidden', 'true');
  title.setAttribute('tabindex', '-1');
  title.textContent = h1.textContent.replace(/\s+/g, ' ').trim();
  title.addEventListener('click', function (event) {
    // Modified clicks keep their browser meaning (new tab, window, save).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  });
  swap.appendChild(title);

  var barHeight = bar.offsetHeight;
  var first = true;

  var observer = new IntersectionObserver(
    function (entries) {
      var entry = entries[0];
      var titled = !entry.isIntersecting && entry.boundingClientRect.bottom < barHeight;
      if (first) {
        first = false;
        if (titled) {
          // The page loaded already scrolled (anchor link, restored
          // position): start titled, without the transition — a swap
          // animating during load is the one moment this feature would call
          // attention to itself.
          bar.classList.add('kt-swap-instant', 'is-titled');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              bar.classList.remove('kt-swap-instant');
            });
          });
          return;
        }
      }
      bar.classList.toggle('is-titled', titled);
    },
    { rootMargin: '-' + Math.ceil(barHeight) + 'px 0px 0px 0px' },
  );
  observer.observe(h1);
})();
