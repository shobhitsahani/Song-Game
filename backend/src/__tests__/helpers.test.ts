import { describe, it, expect } from 'vitest';
import { generateRoomCode, calculateScore, sanitizeHtml, shuffleArray, clamp } from '../utils/helpers';

describe('generateRoomCode', () => {
  it('should generate a 6-character code', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
  });

  it('should only contain valid characters', () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^[A-Z2-9]+$/);
  });

  it('should generate unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateRoomCode()));
    expect(codes.size).toBeGreaterThan(90);
  });

  it('should not contain ambiguous characters', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      expect(code).not.toContain('0');
      expect(code).not.toContain('O');
      expect(code).not.toContain('I');
      expect(code).not.toContain('1');
    }
  });
});

describe('calculateScore', () => {
  it('should return 1000 for fastest response (<=30%)', () => {
    expect(calculateScore(1, 10000)).toBe(1000);
    expect(calculateScore(3000, 10000)).toBe(1000);
  });

  it('should return 700 for medium response (30-60%)', () => {
    expect(calculateScore(4000, 10000)).toBe(700);
    expect(calculateScore(6000, 10000)).toBe(700);
  });

  it('should return 500 for slow response (60-100%)', () => {
    expect(calculateScore(7000, 10000)).toBe(500);
    expect(calculateScore(10000, 10000)).toBe(500);
  });

  it('should return 0 for timeout', () => {
    expect(calculateScore(15000, 10000)).toBe(0);
  });

  it('should handle edge cases', () => {
    expect(calculateScore(0, 10000)).toBe(1000);
    expect(calculateScore(10000, 10000)).toBe(500);
  });
});

describe('sanitizeHtml', () => {
  it('should escape HTML characters', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('should handle ampersands', () => {
    expect(sanitizeHtml('a & b')).toBe('a &amp; b');
  });

  it('should handle single quotes', () => {
    expect(sanitizeHtml("it's")).toBe('it&#x27;s');
  });

  it('should return safe strings unchanged', () => {
    expect(sanitizeHtml('hello world')).toBe('hello world');
  });
});

describe('shuffleArray', () => {
  it('should return array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled).toHaveLength(arr.length);
  });

  it('should contain all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('should not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });
});

describe('clamp', () => {
  it('should return value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should clamp to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should clamp to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
