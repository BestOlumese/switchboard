'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { type ReactNode, useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  scale?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  childSelector?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  yOffset = 36,
  scale = 0.98,
  staggerChildren = false,
  staggerDelay = 0.12,
  childSelector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (staggerChildren) {
        const targets = childSelector
          ? el.querySelectorAll(childSelector)
          : Array.from(el.children);

        if (targets.length > 0) {
          gsap.fromTo(
            targets,
            {
              opacity: 0,
              y: yOffset,
              scale: scale,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration,
              delay,
              stagger: staggerDelay,
              ease: 'back.out(1.3)',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                once: true,
              },
            },
          );
          return;
        }
      }

      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: yOffset,
          scale: scale,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          delay,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        },
      );
    });

    return () => mm.revert();
  }, [delay, duration, yOffset, scale, staggerChildren, staggerDelay, childSelector]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
