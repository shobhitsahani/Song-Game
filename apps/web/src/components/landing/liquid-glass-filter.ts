/**
 * Liquid Glass SVG Refraction Filter Generator (Chromium Progressive Enhancement)
 * Generates an analytical displacement map for capsule rounded rects.
 */

export interface DisplacementMapOptions {
  width: number;
  height: number;
  bezel?: number; // Bezel width in pixels (14-20px)
}

/**
 * Computes distance d to capsule boundary and inward normal (nx, ny)
 */
function getCapsuleDistanceAndNormal(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): { d: number; nx: number; ny: number } {
  // Left cap center: (r, r)
  // Right cap center: (w - r, r)
  if (x < r) {
    const dx = x - r;
    const dy = y - r;
    const dist = Math.hypot(dx, dy);
    if (dist < 1e-4) return { d: r, nx: 0, ny: 0 };
    return {
      d: r - dist,
      nx: -dx / dist,
      ny: -dy / dist,
    };
  } else if (x > w - r) {
    const dx = x - (w - r);
    const dy = y - r;
    const dist = Math.hypot(dx, dy);
    if (dist < 1e-4) return { d: r, nx: 0, ny: 0 };
    return {
      d: r - dist,
      nx: -dx / dist,
      ny: -dy / dist,
    };
  } else {
    // Middle straight section: distance to top or bottom edge
    const distTop = y;
    const distBottom = h - y;
    if (distTop <= distBottom) {
      return {
        d: distTop,
        nx: 0,
        ny: 1, // Points downward into capsule
      };
    } else {
      return {
        d: distBottom,
        nx: 0,
        ny: -1, // Points upward into capsule
      };
    }
  }
}

/**
 * Height profile slope for squircle cross section:
 * h(t) = (1 - (1 - t)^4)^(1/4), t = d / bezel
 */
function getBezelSlope(d: number, bezel: number): number {
  if (d <= 0) return 1;
  if (d >= bezel) return 0;
  const t = d / bezel;
  const u = 1 - t; // 1 at edge, 0 at center
  // Finite difference for robust and smooth slope
  const dt = 0.02;
  const t1 = Math.max(0, t - dt);
  const t2 = Math.min(1, t + dt);
  const h1 = Math.pow(Math.max(0, 1 - Math.pow(1 - t1, 4)), 0.25);
  const h2 = Math.pow(Math.max(0, 1 - Math.pow(1 - t2, 4)), 0.25);
  const slope = (h2 - h1) / (t2 - t1);
  return Math.max(0, Math.min(1, slope * (1 - t)));
}

/**
 * Generates an RGBA displacement map PNG data URL
 */
export function generateDisplacementMap({
  width,
  height,
  bezel = 16,
}: DisplacementMapOptions): string {
  if (typeof document === 'undefined' || width <= 0 || height <= 0) {
    return '';
  }

  const w = Math.round(width);
  const h = Math.round(height);
  const radius = h / 2;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const { d, nx, ny } = getCapsuleDistanceAndNormal(x, y, w, h, radius);

      if (d <= 0) {
        // Outside capsule: neutral
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      } else if (d >= bezel) {
        // Calm center: neutral (no displacement)
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      } else {
        // Bezel area: displace along inward normal
        const m = getBezelSlope(d, bezel);
        const rVal = Math.round(128 + nx * m * 127);
        const gVal = Math.round(128 + ny * m * 127);

        data[idx] = Math.max(0, Math.min(255, rVal));
        data[idx + 1] = Math.max(0, Math.min(255, gVal));
        data[idx + 2] = 128;
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Feature detection: Chromium only, desktop (>768px), fine pointer
 */
export function isRefractionSupported(): boolean {
  if (typeof window === 'undefined') return false;

  // Reduced transparency preference check
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
    return false;
  }

  // Viewport & Pointer checks
  if (window.innerWidth < 768) return false;
  if (window.matchMedia('(pointer: coarse)').matches) return false;

  // Chromium check
  const uad = (navigator as unknown as { userAgentData?: { brands?: { brand: string }[] } })?.userAgentData;
  if (uad?.brands && Array.isArray(uad.brands)) {
    return uad.brands.some((b) => b.brand === 'Chromium' || b.brand === 'Google Chrome' || b.brand === 'Microsoft Edge');
  }

  const ua = navigator.userAgent;
  // Exclude Safari (which lacks Chromium brand) and Firefox
  const isFirefox = /Firefox/i.test(ua);
  const isChromiumUA = /Chrome|Chromium|Edg/i.test(ua) && !isFirefox;
  return isChromiumUA;
}
