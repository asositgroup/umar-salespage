// Variant presentation. Shared scripts still own checkout, tracking and video playback.
(function () {
  var marquee = document.querySelector('.mq');
  var track = marquee.querySelector('.mqTrack');
  var previews = marquee.querySelectorAll('video');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var marqueeVisible = true;
  var period = track.children[1].offsetLeft - track.children[0].offsetLeft;
  var offset = -period;
  var busy = false;
  var selectedVideo = null;
  var pendingVideo = null;
  var centering = null;
  var frame = 0;
  var lastTime = 0;

  // Keep a full repeated set on either side of the visible cards. Only this
  // controller writes the transform, so pause/resume never resets loop progress.
  track.classList.add('is-managed');
  function render() {
    track.style.transform = 'translate3d(' + offset + 'px,0,0)';
  }
  function wrap(value) {
    return -period - ((-value - period) % period + period) % period;
  }
  function schedule() {
    var moving = marqueeVisible && (centering || (!busy && !reducedMotion.matches));
    if (moving && !frame) frame = requestAnimationFrame(tick);
    if (!moving) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    }
  }
  function tick(now) {
    frame = 0;
    var elapsed = lastTime ? Math.min(now - lastTime, 64) : 0;
    lastTime = now;
    if (centering) {
      var progress = Math.min((now - centering.started) / 320, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      offset = centering.from + (centering.to - centering.from) * eased;
      if (progress === 1) centering = null;
    } else if (!busy && !reducedMotion.matches) {
      offset = wrap(offset - period * elapsed / 38000);
    }
    render();
    schedule();
  }
  function centerVideo(video, instant) {
    selectedVideo = video;
    busy = true;
    marquee.classList.add('is-playing');

    // Rotate an unused buffer, never the selected video. This also handles
    // repeated selections towards either edge without revealing an empty gap.
    var set = video.closest('.mqSet');
    if (set === track.firstElementChild) {
      track.insertBefore(track.lastElementChild, track.firstElementChild);
      offset -= period;
    } else if (set === track.lastElementChild) {
      track.appendChild(track.firstElementChild);
      offset += period;
    }
    render();
    var bounds = marquee.getBoundingClientRect();
    var card = video.parentNode.getBoundingClientRect();
    var target = offset + bounds.left + bounds.width / 2 - card.left - card.width / 2;
    if (instant || reducedMotion.matches) {
      offset = target;
      centering = null;
      render();
    } else {
      centering = { from: offset, to: target, started: performance.now() };
    }
    schedule();
  }

  function syncMarquee() {
    if (pendingVideo && (!pendingVideo.parentNode.querySelector('.slide_play').hidden ||
        pendingVideo.ended || pendingVideo.error)) pendingVideo = null;
    busy = Array.prototype.some.call(previews, function (video) {
      return !video.paused || pendingVideo === video;
    });
    if (!busy) {
      selectedVideo = null;
      centering = null;
    }
    marquee.classList.toggle('is-playing', busy);
    schedule();
  }

  // Center in the capture phase, while the shared player's play() remains in
  // the original tap (required for unmuted playback on mobile browsers).
  marquee.addEventListener('click', function (event) {
    var button = event.target.closest('.slide_play');
    if (button) {
      pendingVideo = button.parentNode.querySelector('video');
      centerVideo(pendingVideo);
    }
  }, true);
  previews.forEach(function (video) {
    video.addEventListener('play', function () {
      if (pendingVideo === video) pendingVideo = null;
      if (!marqueeVisible) video.pause();
      else if (selectedVideo !== video) centerVideo(video);
      syncMarquee();
    });
    ['pause', 'ended', 'error'].forEach(function (event) {
      video.addEventListener(event, function () {
        if (pendingVideo === video) pendingVideo = null;
        if (selectedVideo === video) {
          selectedVideo = null;
          centering = null;
        }
        syncMarquee();
      });
    });
  });
  // The shared player restores its button on rejected play()/loading failures.
  new MutationObserver(syncMarquee).observe(marquee, {
    subtree: true, attributes: true, attributeFilter: ['hidden']
  });
  function resize() {
    var nextPeriod = track.children[1].offsetLeft - track.children[0].offsetLeft;
    if (!nextPeriod) return;
    offset *= nextPeriod / period;
    period = nextPeriod;
    render();
    if (selectedVideo) centerVideo(selectedVideo, true);
    else offset = wrap(offset);
    render();
    schedule();
  }
  if ('ResizeObserver' in window) {
    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(marquee);
    resizeObserver.observe(track.firstElementChild);
  } else {
    window.addEventListener('resize', resize);
  }
  reducedMotion.addEventListener('change', function () {
    if (selectedVideo) centerVideo(selectedVideo, true);
    schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      marqueeVisible = entries[0].isIntersecting;
      if (!marqueeVisible) {
        previews.forEach(function (video) { video.pause(); });
        centering = null;
      }
      schedule();
    }).observe(marquee);
  }
  render();
  schedule();

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
