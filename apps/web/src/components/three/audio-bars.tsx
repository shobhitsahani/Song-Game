'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AudioBarsProps {
  isPlaying?: boolean;
  className?: string;
}

export function AudioBars({ isPlaying = false, className = '' }: AudioBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check reduced motion or low concurrency
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    const width = 300;
    const height = 140;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 100);
    camera.position.z = 10;

    const barCount = 18;
    const barWidth = 8;
    const spacing = 14;
    const totalW = barCount * spacing;
    const startX = -totalW / 2 + spacing / 2;

    const barMeshes: THREE.Mesh[] = [];
    const geometry = new THREE.PlaneGeometry(barWidth, 1);

    // Accent color from CSS variable
    const computedAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const material = new THREE.MeshBasicMaterial({
      color: computedAccent ? 0x06b6d4 : 0xec4899,
      transparent: true,
      opacity: 0.28,
    });

    for (let i = 0; i < barCount; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = startX + i * spacing;
      mesh.position.y = -height / 4;
      scene.add(mesh);
      barMeshes.push(mesh);
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const start = performance.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = (performance.now() - start) / 1000;
      barMeshes.forEach((mesh, i) => {
        const speed = isPlaying ? 6 : 2;
        const wave = Math.sin(elapsed * speed + i * 0.45) * 0.5 + 0.5;
        const heightMultiplier = isPlaying ? 50 : 20;
        const h = Math.max(6, wave * heightMultiplier + (isPlaying ? 15 : 6));
        mesh.scale.y = h;
        mesh.position.y = -height / 6 + h / 2;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none opacity-40 select-none ${className}`}
      aria-hidden="true"
    />
  );
}
