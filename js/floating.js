/* Nyl Dev — floating action buttons
   Injected into every page automatically */
(function () {
  if (document.querySelector('.fab-stack')) return;
  if (document.querySelector('.cookie')) {
    // cookie banner is present — still show FABs above it
  }

  var stack = document.createElement('div');
  stack.className = 'fab-stack';
  stack.setAttribute('aria-label', 'Quick actions');
  stack.innerHTML =
    '<a class="fab fab--scroll-top" href="#" aria-label="Back to top" id="fabTop">' +
      '<i data-lucide="arrow-up"></i>' +
    '</a>' +
    '<a class="fab fab--contact" href="contact.html" aria-label="Contact us">' +
      '<i data-lucide="message-square"></i>' +
      '<span class="fab__label">Message us</span>' +
    '</a>' +
    '<a class="fab fab--whatsapp" href="https://wa.me/27609583089?text=' +
      encodeURIComponent('Hi Nyl Dev, I want to build something.') +
      '" target="_blank" rel="noopener" aria-label="WhatsApp us">' +
      '<i data-lucide="phone"></i>' +
      '<span class="fab__label">WhatsApp</span>' +
    '</a>';

  document.body.appendChild(stack);

  var top = document.getElementById('fabTop');
  if (top) {
    top.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    var onScroll = function () {
      top.classList.toggle('is-visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (window.lucide) window.lucide.createIcons();
})();
