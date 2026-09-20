/* Nyl Web Dev — shared JS
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */
'use strict';

// ---- 1. Icons ----
if (window.lucide && typeof window.lucide.createIcons === 'function') {
  window.lucide.createIcons();
}

// ---- 2. Mobile nav ----
(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    if (window.lucide) window.lucide.createIcons();
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i data-lucide="menu"></i>';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  });
})();

// ---- 3. Scroll reveal ----
(function () {
  var selectors = '.card, .stat, .notice, .section__title, .page-head__title, .form, .tier';
  var els = document.querySelectorAll(selectors);
  if (!els.length) return;

  els.forEach(function (el) {
    el.classList.add('reveal');
    var siblings = el.parentElement ? el.parentElement.children : [];
    var idx = Array.prototype.indexOf.call(siblings, el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 50, 250) + 'ms';
  });

  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  els.forEach(function (el) { observer.observe(el); });
})();

// ---- 4. Navbar shadow ----
(function () {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;
  var onScroll = function () {
    navbar.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---- 5. Footer year ----
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// ---- 6. Cookie banner ----
(function () {
  var KEY = 'nylwebdev.cookies.v1';
  var choice;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice) return;

  var banner = document.createElement('div');
  banner.className = 'cookie';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<p>We use essential cookies to make this site work. ' +
    'We do not use tracking or advertising cookies. ' +
    'Read our <a href="privacy.html">privacy policy</a>.</p>' +
    '<div class="cookie__actions">' +
      '<button class="btn btn--ghost" data-cookie="decline" type="button">Decline</button>' +
      '<button class="btn btn--primary" data-cookie="accept" type="button">Accept</button>' +
    '</div>';

  document.body.appendChild(banner);

  banner.querySelectorAll('[data-cookie]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-cookie');
      try { localStorage.setItem(KEY, val); } catch (e) {}
      banner.classList.add('is-hidden');
      setTimeout(function () { banner.remove(); }, 300);
    });
  });
})();

// ---- 7. Simple contact form fallback (if used instead of chat UI) ----
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (form.name && form.name.value || '').trim();
    var email = (form.email && form.email.value || '').trim();
    var type = (form.type && form.type.value || '').trim();
    var message = (form.message && form.message.value || '').trim();

    if (!name || !message) {
      alert('Please fill in your name and message.');
      return;
    }

    var lines = [
      'New enquiry from Nyl Web Dev website',
      '',
      'Name: ' + name,
      'Email: ' + (email || 'not provided'),
      'Type: ' + type,
      '',
      'Message:',
      message
    ];

    var text = encodeURIComponent(lines.join('\n'));
    window.open('https://wa.me/27609583089?text=' + text, '_blank', 'noopener');
  });
})();

// ---- 8. AI status check (used on contact + create pages) ----
// Exposes window.NYLDEV.checkAI(callback)
(function () {
  window.NYLDEV = window.NYLDEV || {};

  var cache = { result: null, at: 0 };
  var CACHE_MS = 60 * 1000;

  window.NYLDEV.checkAI = function (callback) {
    var now = Date.now();
    if (cache.result && now - cache.at < CACHE_MS) {
      callback(cache.result);
      return;
    }

    fetch('/api/status', { method: 'GET' })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        var ok = !!(data && data.ok);
        cache = { result: { ok: ok, providers: data.providers || [] }, at: now };
        callback(cache.result);
      })
      .catch(function () {
        cache = { result: { ok: false, providers: [] }, at: now };
        callback(cache.result);
      });
  };
})();