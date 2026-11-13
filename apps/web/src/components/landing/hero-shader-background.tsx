'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { useTheme } from '@/components/glass/theme-switcher';

const THEME_SHADER_COLORS: Record<string, string[]> = {
  black: ['#0d0c11', '#d97706', '#0284c7', '#581c87', '#17151f'],
  rose: ['#1f0a14', '#e11d48', '#ea580c', '#9d174d', '#2d0e1d'],
  light: ['#f8fafc', '#3b82f6', '#38bdf8', '#fb923c', '#e2e8f0'],
};

export function HeroShaderBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Visibility change (tab hidden)
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // IntersectionObserver to pause shader when hero is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, []);

  // Cap shader at ~30fps with pixel ratio 1
  useEffect(() => {
    if (!mounted || !hasWebGL || prefersReducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    // The MeshGradient wraps inside containerRef
    const setupMount = () => {
      const shaderEl = (el.querySelector('div') || el.firstElementChild) as (HTMLElement & {
        paperShaderMount?: {
          render: (t: number) => void;
          requestRender: () => void;
          setMinPixelRatio: (r: number) => void;
          currentSpeed: number;
          __fpsCapped?: boolean;
        };
      }) | null;

      if (shaderEl?.paperShaderMount) {
        const mount = shaderEl.paperShaderMount;
        mount.setMinPixelRatio(1);
        if (!mount.__fpsCapped) {
          mount.__fpsCapped = true;
          const origRender = mount.render;
          let lastRenderTime = 0;
          mount.render = (currentTime: number) => {
            if (currentTime - lastRenderTime < 32) {
              if (mount.currentSpeed !== 0) {
                mount.requestRender();
              }
              return;
            }
            lastRenderTime = currentTime;
            origRender(currentTime);
          };
        }
      }
    };

    const timer = setTimeout(setupMount, 100);
    return () => clearTimeout(timer);
  }, [mounted, hasWebGL, prefersReducedMotion]);

  const activeColors = THEME_SHADER_COLORS[theme] || THEME_SHADER_COLORS.black;
  const isPlaying = isInView && isTabVisible && !prefersReducedMotion;

  if (!mounted || !hasWebGL || prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none -z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, var(--glow) 0%, transparent 70%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-[100dvh] w-full overflow-hidden select-none -z-10"
      style={{
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
      }}
    >
      <MeshGradient
        colors={activeColors}
        speed={isPlaying ? 0.12 : 0}
        distortion={0.35}
        swirl={0.25}
        grainMixer={0.08}
        grainOverlay={0.02}
        minPixelRatio={1}
        maxPixelCount={1280 * 720}
        className="w-full h-full opacity-70 transition-opacity duration-1000"
      />
    </div>
  );
}
