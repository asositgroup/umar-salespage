// Presentation only. Checkout, timers, media playback and tracking live in shared scripts.
(function () {
  var lessons = document.getElementById('lesWrap');
  var toggle = document.getElementById('lesBtn');
  toggle.addEventListener('click', function () {
    var expanded = lessons.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Yopish ↑' : "Barcha 15 ta darsni ko'rish ↓";
  });

  var heroCta = document.querySelector('.hero .ctaBox');
  var sticky = document.getElementById('sticky');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      sticky.classList.toggle('on', !entry.isIntersecting && entry.boundingClientRect.top < 0);
    }).observe(heroCta);
  } else {
    sticky.classList.add('on');
  }
})();
