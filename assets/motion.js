(() => {
  'use strict';

  // Add classes only when the script is running, keeping the static page visible as a fallback.
  if (!('IntersectionObserver' in window)) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = [...document.querySelectorAll('main > section')].filter(section => !section.classList.contains('hero'));
  revealItems.forEach((section, index) => {
    section.classList.add('motion-reveal');
    section.dataset.delay = String(Math.min(index, 2));
  });
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach(item => observer.observe(item));

  const image = document.querySelector('.hero-image-wrap img');
  let ticking = false;
  const updateScrollMotion = () => {
    ticking = false;
    if (!image || preference.matches) return;
    const amount = Math.min(window.scrollY, 600);
    image.style.setProperty('--scroll-shift', Math.round(amount * -0.035));
    image.style.setProperty('--scroll-scale', (amount * 0.000025).toFixed(4));
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScrollMotion); } }, { passive: true });
  updateScrollMotion();
})();
