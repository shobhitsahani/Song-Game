'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function CelebrationTrophy({ size = 160 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 4);

    const light = new THREE.DirectionalLight(0xfff0c0, 3);
    light.position.set(2, 4, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    // Floating Golden Trophy Cup geometry
    const trophyGroup = new THREE.Group();
    scene.add(trophyGroup);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });

    // Cup
    const cupGeo = new THREE.CylinderGeometry(0.7, 0.3, 0.9, 32, 1, true);
    const cup = new THREE.Mesh(cupGeo, goldMat);
    cup.position.y = 0.3;
    trophyGroup.add(cup);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16);
    const stem = new THREE.Mesh(stemGeo, goldMat);
    stem.position.y = -0.3;
    trophyGroup.add(stem);

    // Base
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.25, 24);
    const base = new THREE.Mesh(baseGeo, goldMat);
    base.position.y = -0.6;
    trophyGroup.add(base);

    const start = performance.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - start) / 1000;
      trophyGroup.rotation.y = elapsed * 1.2;
      trophyGroup.position.y = Math.sin(elapsed * 2) * 0.12;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      cupGeo.dispose();
      stemGeo.dispose();
      baseGeo.dispose();
      goldMat.dispose();
    };
  }, [size]);

  return <canvas ref={canvasRef} className="mx-auto block drop-shadow-xl" />;
}
