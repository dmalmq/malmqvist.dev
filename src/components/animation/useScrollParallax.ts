// useScrollParallax.ts — GSAP ScrollTrigger scrubbed parallax (NOT 80%-viewport fade-up — that's Reveal.astro)
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const parallaxMedia = new Set<gsap.MatchMedia>();

export interface ParallaxOptions {
  /** Element to translate (parallax target). Required. */
  readonly target: HTMLElement | null;
  /** Translate distance in pixels. Default 40. */
  readonly distance?: number;
  /** Start position offset. Default 0. */
  readonly start?: string;
  /** End position offset. Default 'bottom top'. */
  readonly end?: string;
}

/**
 * Registers a scrubbed parallax animation: element translates from y:0 (at viewport top)
 * to y:-distance (at viewport bottom). Uses gsap.matchMedia to honor prefers-reduced-motion.
 * Under reduced motion: no ScrollTrigger registered, element stays static.
 */
export const useScrollParallax = (options: ParallaxOptions) => {
  const { target, distance = 40, start = 'top bottom', end = 'bottom top' } = options;
  if (!target) return;

  const mm = gsap.matchMedia();
  parallaxMedia.add(mm);

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(
      target,
      { y: 0 },
      {
        y: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: target,
          start,
          end,
          scrub: true,
        },
      }
    );
  });
};

/**
 * Cleanup helper: revert all matchMedia registrations created by this helper.
 * Call on element unmount.
 */
export const cleanupParallax = () => {
  for (const media of parallaxMedia) {
    media.revert();
  }
  parallaxMedia.clear();
};
