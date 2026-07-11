// smooth-scroll.ts — initializes Lenis smooth scroll, respects prefers-reduced-motion
import Lenis from 'lenis';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

if (!prefersReducedMotion) {
  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

export { lenis };
