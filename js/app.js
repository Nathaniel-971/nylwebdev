/* Nyl Web Dev — shared JS
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */
'use strict';

// ---- 1. Icons ----
if (window.lucide && typeof window.lucide.createIcons === 'function') {
  window.lucide.createIcons();
}

// ---- 2. Logo injection: mark + text + tagline + SA flag ----
(function () {
  var brand = document.querySelector('.navbar .brand');
  if (!brand) return;

  // Restructure brand: keep mark, wrap name + tag in a column
  var nameEl = brand.querySelector('.brand__name');
  var markEl = brand.querySelector('.brand__mark');

  if (markEl && !brand.querySelector('.brand__text')) {
    // Rename text
    if (nameEl) nameEl.textContent = 'Nyl Dev';

    // Create column wrapper
    var textWrap = document.createElement('span');
    textWrap.className = 'brand__text';

    // Move name into it
    if (nameEl) textWrap.appendChild(nameEl);

    // Add tagline
    var tagEl = document.createElement('span');
    tagEl.className = 'brand__tag';
    tagEl.textContent = 'I create · Apps & Sites';
    textWrap.appendChild(tagEl);

    brand.appendChild(textWrap);
  }

  // SA flag
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

// ---- 3. Apply brand colors to logo-classed SVGs (exceptions) ----
(function () {
  // Any <svg class="brand-logo brand-logo--whatsapp"> gets the WhatsApp green
  // Color is already in CSS. This just ensures fill="currentColor" is set.
  document.querySelectorAll('.brand-logo').forEach(function (svg) {
    if (!svg.getAttribute('fill')) svg.setAttribute('fill', 'currentColor');
  });
})();

// ---- 4. Mobile nav toggle ----
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

// ---- 5. Scroll reveal ----
(function () {
  var selectors = '.card, .tier, .stat, .notice, .section__title, .page-head__title';
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

// ---- 6. Navbar shadow on scroll ----
(function () {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;
  var onScroll = function () {
    navbar.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---- 7. Footer year ----
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();