// /a/ keeps the lead form, then opens the returned Telegram link automatically.
(function () {
  var view = document.getElementById('redirectView');
  if (!view) return;

  var card = document.getElementById('checkoutCard');
  var overlay = document.getElementById('ovl');
  var submit = document.getElementById('subBtn');
  var submitLabel = submit.innerHTML;
  var status = document.getElementById('redirectStatus');
  var link = document.getElementById('redirectLink');
  var fallback = document.getElementById('redirectFallback');
  var defaultUrl = 'https://t.me/' + CONFIG.BOT_USERNAME;
  var closeForm = window.closeModal;
  var active = null;
  var retryTimer = null;

  function reset() {
    var previous = active;
    active = null;
    if (previous) {
      clearTimeout(previous.deadline);
      if (previous.controller) previous.controller.abort();
    }
    clearTimeout(retryTimer);
    retryTimer = null;
    view.hidden = true;
    card.hidden = false;
    fallback.hidden = true;
    overlay.classList.remove('is-redirecting');
    submit.disabled = false;
    submit.innerHTML = submitLabel;
  }

  window.closeModal = function () {
    reset();
    closeForm();
  };

  // Returning from Telegram must not leave a cached page stuck on the loader.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && active) window.closeModal();
  });

  function responseUrl(data) {
    var bot = data && data.bot;
    if (!data || !data.status || !bot || !bot.available || !bot.telegram_url) return defaultUrl;
    try {
      var url = new URL(bot.telegram_url);
      if (url.protocol === 'https:' && url.hostname === 't.me' &&
          !url.username && !url.password && !url.port && url.pathname.length > 1) {
        return url.href;
      }
    } catch (error) {}
    return defaultUrl;
  }

  window.submitLead = function (event) {
    event.preventDefault();
    if (active) return false;

    var nameInput = document.getElementById('nm');
    var phoneInput = document.getElementById('ph');
    var name = nameInput.value.trim();
    var rawPhone = phoneInput.value.replace(/\D/g, '');
    var valid = true;
    if (name.length < 2) {
      document.getElementById('fName').classList.add('bad');
      valid = false;
    }
    if (rawPhone.length !== 9) {
      document.getElementById('fPhone').classList.add('bad');
      valid = false;
    }
    if (!valid) return false;

    var request = {
      controller: window.AbortController ? new AbortController() : null,
      deadline: null,
      finished: false
    };
    active = request;
    submit.disabled = true;
    card.hidden = true;
    view.hidden = false;
    fallback.hidden = true;
    link.href = defaultUrl;
    status.textContent = "Telegramga o'tilmoqda...";
    overlay.classList.add('is-redirecting');
    status.focus({ preventScroll: true });

    function finish(url) {
      if (active !== request || request.finished) return;
      request.finished = true;
      clearTimeout(request.deadline);
      link.href = url;
      status.textContent = 'Telegram ochilmoqda...';
      // A direct link remains available if an in-app browser blocks the handoff.
      retryTimer = setTimeout(function () {
        if (active === request) fallback.hidden = false;
      }, 1500);
      try {
        if (window.fbq) window.fbq('track', 'CompleteRegistration');
      } catch (error) {}
      try {
        window.location.assign(url);
      } catch (error) {
        clearTimeout(retryTimer);
        retryTimer = null;
        fallback.hidden = false;
      }
    }

    // Finish independently of abort support, and ignore any response arriving late.
    request.deadline = setTimeout(function () {
      finish(defaultUrl);
      if (request.controller) request.controller.abort();
    }, CONFIG.LEAD_TIMEOUT);

    var phone = '+998' + rawPhone;
    sendToSheet(name, phone);
    try {
      fetch(CONFIG.LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: phone,
          TARIF: CONFIG.LEAD_TARIF,
          secret_key: CONFIG.LEAD_SECRET
        }),
        signal: request.controller ? request.controller.signal : undefined,
        keepalive: true
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Lead request failed');
          return response.json();
        })
        .then(function (data) { finish(responseUrl(data)); })
        .catch(function () { finish(defaultUrl); });
    } catch (error) {
      finish(defaultUrl);
    }
    return false;
  };
})();
