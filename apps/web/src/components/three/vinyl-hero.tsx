'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface VinylHeroProps {
  className?: string;
  size?: number;
}

export function VinylHero({ className = '', size = 320 }: VinylHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldUseFallback, setShouldUseFallback] = useState(false);

  useEffect(() => {
    // Check constraints: reduced motion, low core count, Save-Data
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSaveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    const isLowPower = (navigator.hardwareConcurrency || 4) <= 2;

    if (prefersReducedMotion || isSaveData || isLowPower) {
      setShouldUseFallback(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Three.js scene setup
    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setShouldUseFallback(true);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(size, size);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    // Group for vinyl disc
    const vinylGroup = new THREE.Group();
    scene.add(vinylGroup);

    // Procedural Vinyl Disc
    const discRadius = 1.6;
    const discGeometry = new THREE.CylinderGeometry(discRadius, discRadius, 0.04, 64);

    // Vinyl black material with anisotropic sheen reflection
    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.35,
      metalness: 0.75,
    });
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.rotation.x = Math.PI / 2;
    vinylGroup.add(disc);

    // Vinyl Grooves (concentric thin toruses)
    const grooveMaterial = new THREE.MeshBasicMaterial({
      color: 0x222228,
      transparent: true,
      opacity: 0.4,
    });
    for (let r = 0.85; r < 1.5; r += 0.08) {
      const grooveGeo = new THREE.RingGeometry(r, r + 0.015, 48);
      const groove = new THREE.Mesh(grooveGeo, grooveMaterial);
      groove.position.z = 0.022;
      vinylGroup.add(groove);
    }

    // Center Label (Accent color from CSS variable)
    const labelRadius = 0.65;
    const labelGeo = new THREE.CircleGeometry(labelRadius, 48);

    // Get primary accent color
    const computedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const labelMaterial = new THREE.MeshStandardMaterial({
      color: computedPrimary ? 0xf59e0b : 0xe11d48,
      roughness: 0.4,
      metalness: 0.1,
    });
    const label = new THREE.Mesh(labelGeo, labelMaterial);
    label.position.z = 0.025;
    vinylGroup.add(label);

    // Spindle Hole
    const spindleGeo = new THREE.CircleGeometry(0.08, 24);
    const spindleMaterial = new THREE.MeshBasicMaterial({ color: 0x050508 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMaterial);
    spindle.position.z = 0.026;
    vinylGroup.add(spindle);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff5ea, 2.5);
    dirLight1.position.set(3, 4, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    dirLight2.position.set(-3, -2, 2);
    scene.add(dirLight2);

    // Pointer tilt tracking
    let targetRotX = 0.2;
    let targetRotY = 0;
    let currentRotX = 0.2;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.8;
      targetRotX = -y * 0.8 + 0.2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let lastTime = performance.now();
    const spinSpeed = 0.4; // rad / second

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Spin disc around its Z axis
      disc.rotation.y += spinSpeed * delta;

      // Spring-smoothed tilt toward pointer
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      vinylGroup.rotation.x = currentRotX;
      vinylGroup.rotation.y = currentRotY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      discGeometry.dispose();
      discMaterial.dispose();
      labelGeo.dispose();
      labelMaterial.dispose();
      spindleGeo.dispose();
      spindleMaterial.dispose();
    };
  }, [size]);

  if (shouldUseFallback) {
    return (
      <div
        className={`relative rounded-full flex items-center justify-center liquid-glass-surface shadow-2xl ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black p-4 flex items-center justify-center border-4 border-zinc-800 shadow-2xl animate-spin [animation-duration:12s]">
          <div className="w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg border-2 border-white/20">
            <div className="w-4 h-4 rounded-full bg-black" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} className="block pointer-events-none drop-shadow-2xl" />
    </div>
  );
}
