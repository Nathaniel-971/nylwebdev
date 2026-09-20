/* Nyl Dev — shared JS
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */
'use strict';

// ---- 1. Icons ----
if (window.lucide && typeof window.lucide.createIcons === 'function') {
  window.lucide.createIcons();
}

// ---- 2. Copy protection (deterrent only) ----
(function () {
  document.addEventListener('contextmenu', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'img' || tag === 'svg' || tag === 'video') {
      e.preventDefault();
      return false;
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C'].indexOf(e.key) !== -1) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
    if (e.metaKey && e.altKey && ['I','J','C','U'].indexOf(e.key) !== -1) { e.preventDefault(); return false; }
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
})();

// ---- 3. Header hide on scroll down ----
(function () {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;
  var lastY = 0;
  var ticking = false;
  var HIDE_AFTER = 120;

  function onScroll() {
    var y = window.scrollY;
    if (y > HIDE_AFTER && y > lastY) navbar.classList.add('is-hidden');
    else navbar.classList.remove('is-hidden');
    navbar.classList.toggle('is-scrolled', y > 10);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
})();

// ---- 4. Mobile nav ----
(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  var navbar = document.querySelector('.navbar');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    if (navbar) navbar.classList.remove('is-hidden');
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

  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('is-open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i data-lucide="menu"></i>';
    if (window.lucide) window.lucide.createIcons();
  });
})();

// ---- 5. Scroll reveal ----
(function () {
  var selectors = '.card, .stat, .notice, .section__title, .page-head__title, .tier';
  var els = document.querySelectorAll(selectors);
  if (!els.length) return;

  els.forEach(function (el) {
    el.classList.add('reveal');
    var siblings = el.parentElement ? el.parentElement.children : [];
    var idx = Array.prototype.indexOf.call(siblings, el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 40, 220) + 'ms';
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
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) { observer.observe(el); });
})();

// ---- 6. Footer year ----
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// ---- 7. Cookie banner ----
(function () {
  var KEY = 'nylwebdev.cookies.v2';
  var choice;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice) return;

  var banner = document.createElement('div');
  banner.className = 'cookie';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<p>We use essential cookies to make this site work. We do not use tracking or advertising cookies. ' +
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

// ---- 8. AI status check ----
(function () {
  window.NYLDEV = window.NYLDEV || {};
  var cache = { result: null, at: 0 };
  var CACHE_MS = 60 * 1000;

  window.NYLDEV.checkAI = function (callback) {
    var now = Date.now();
    if (cache.result && now - cache.at < CACHE_MS) { callback(cache.result); return; }
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
