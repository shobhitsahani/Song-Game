'use client';

import React, { useEffect, useState } from 'react';
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

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  const activeColors = THEME_SHADER_COLORS[theme] || THEME_SHADER_COLORS.black;

  if (!mounted || !hasWebGL || prefersReducedMotion) {
    return (
      <div
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
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-[100dvh] w-full overflow-hidden select-none -z-10"
      style={{
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
      }}
    >
      <MeshGradient
        colors={activeColors}
        speed={0.15}
        distortion={0.4}
        swirl={0.3}
        grainMixer={0.1}
        grainOverlay={0.03}
        maxPixelCount={1920 * 1080}
        className="w-full h-full opacity-70 transition-opacity duration-1000"
      />
    </div>
  );
}
