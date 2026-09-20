/* Nyl Web Dev - shared JS
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */
'use strict';

lucide.createIcons();

// Mobile nav
(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    lucide.createIcons();
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<i data-lucide="menu"></i>';
        lucide.createIcons();
      }
    });
  });
})();

// Footer year
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();