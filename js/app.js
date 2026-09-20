/* Nyl Web Dev - shared JS
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */
'use strict';

// ---- 1. Icons ----
if (window.lucide && typeof window.lucide.createIcons === 'function') {
  window.lucide.createIcons();
}

// ---- 2. Inject branding: SA flag + "Apps & Websites" tag ----
(function () {
  var brand = document.querySelector('.navbar .brand');
  if (!brand) return;

  // Replace brand name with "Nyl Dev" + tag
  var nameEl = brand.querySelector('.brand__name');
  if (nameEl && !brand.querySelector('.brand__tag')) {
    nameEl.textContent = 'Nyl Dev';
    var tag = document.createElement('span');
    tag.className = 'brand__tag';
    tag.textContent = 'Apps & Websites';
    brand.appendChild(tag);
  }

  // Add SA flag
  if (!brand.querySelector('.sa-flag')) {
    var flag = document.createElement('span');
    flag.className = 'sa-flag';
    flag.setAttribute('aria-label', 'South Africa');
    flag.setAttribute('title', 'Proudly South African');
    flag.innerHTML =
      '<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<rect width="90" height="60" fill="#fff"/>' +
        '<rect width="90" height="20" fill="#de3831"/>' +
        '<rect y="40" width="90" height="20" fill="#002395"/>' +
        '<path d="M0 0 L30 30 L0 60 Z" fill="#007a4d"/>' +
        '<path d="M30 30 L90 20 L90 40 Z" fill="#007a4d"/>' +
        '<path d="M0 0 L20 30 L0 60 Z" fill="#000"/>' +
        '<path d="M0 0 L20 30 L0 60 Z" fill="none" stroke="#fcb514" stroke-width="3"/>' +
        '<path d="M30 30 L90 20" stroke="#fff" stroke-width="3"/>' +
        '<path d="M30 30 L90 40" stroke="#fff" stroke-width="3"/>' +
      '</svg>';
    brand.appendChild(flag);
  }
})();

// ---- 3. Mobile nav toggle ----
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

// ---- 4. Scroll reveal ----
(function () {
  var selectors = '.card, .tier, .stat, .notice, .section__title, .page-head__title';
  var els = document.querySelectorAll(selectors);
  if (!els.length) return;

  els.forEach(function (el) {
    el.classList.add('reveal');
    var siblings = el.parentElement ? el.parentElement.children : [];
    var idx = Array.prototype.indexOf.call(siblings, el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 60, 300) + 'ms';
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

// ---- 5. Navbar shadow on scroll ----
(function () {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;
  var onScroll = function () {
    navbar.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---- 6. Footer year ----
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();