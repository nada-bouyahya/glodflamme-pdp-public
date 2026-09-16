(() => {
  'use strict';

  // A single place → charge → enjoy sequence, revealed as it enters the view.
  // WAAPI starts from visible content; no JS/CSS failure can hide the section.
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const play = (element, frames, duration, delay = 0) => {
    if (!element || preference.matches || document.hidden) return;
    const animation = element.animate(frames, { duration, delay, easing, fill: 'backwards' });
    active.add(animation);
    const cleanup = () => active.delete(animation);
    animation.addEventListener('finish', cleanup, { once: true });
    animation.addEventListener('cancel', cleanup, { once: true });
  };
  const finishMotion = () => {
    for (const animation of active) animation.cancel();
    active.clear();
  };
  preference.addEventListener('change', finishMotion);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishMotion();
  });

  const sequence = document.querySelector('.how-layout');
  if (!sequence) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      play(sequence.querySelector('.feature-image'), [
        { clipPath: 'inset(0 0 8% 0 round 14px)', opacity: 0.65 },
        { clipPath: 'inset(0 0 0% 0 round 14px)', opacity: 1 }
      ], 700);
      sequence.querySelectorAll('.steps li').forEach((step, index) => {
        play(step, [
          { transform: 'translateY(12px)', opacity: 0.45 },
          { transform: 'translateY(0)', opacity: 1 }
        ], 480, Math.min(index, 2) * 90);
      });
    }
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

  // Product copy arrives asynchronously; start only when the steps exist.
  const steps = sequence.querySelector('.steps');
  if (!steps) return;
  if (steps.children.length) observer.observe(sequence);
  else {
    const contentObserver = new MutationObserver(() => {
      if (!steps.children.length) return;
      contentObserver.disconnect();
      observer.observe(sequence);
    });
    contentObserver.observe(steps, { childList: true });
  }
})();
