import { describe, it, expect } from 'vitest';
import { generateRoomCode, normalizeString, checkAnswer, calculatePoints } from '../utils/room';

describe('Room Code Generation', () => {
  it('should generate 6-character codes', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
  });

  it('should only contain valid characters', () => {
    const valid = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode();
      for (const char of code) {
        expect(valid).toContain(char);
      }
    }
  });

  it('should generate unique codes', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateRoomCode());
    }
    expect(codes.size).toBe(1000);
  });
});

describe('String Normalization', () => {
  it('should lowercase strings', () => {
    expect(normalizeString('HELLO World')).toBe('hello world');
  });

  it('should remove special characters', () => {
    expect(normalizeString('hello-world!')).toBe('helloworld');
  });

  it('should collapse whitespace', () => {
    expect(normalizeString('  hello   world  ')).toBe('hello world');
  });
});

describe('Answer Checking', () => {
  it('should match exact answers', () => {
    expect(checkAnswer('hello world', 'hello world')).toBe(true);
  });

  it('should match case-insensitively', () => {
    expect(checkAnswer('HELLO WORLD', 'hello world')).toBe(true);
  });

  it('should match with partial word overlap (70%)', () => {
    expect(checkAnswer('hello world foo', 'hello world')).toBe(true);
  });

  it('should reject insufficient matches', () => {
    expect(checkAnswer('hello', 'world').valueOf).not.toBe(true);
  });
});

describe('Points Calculation', () => {
  it('should award 1000 points for fast answers (<=3s)', () => {
    expect(calculatePoints(2, 15)).toBe(1000);
    expect(calculatePoints(3, 15)).toBe(1000);
  });

  it('should award 700 points for medium answers (<=6s)', () => {
    expect(calculatePoints(4, 15)).toBe(700);
    expect(calculatePoints(6, 15)).toBe(700);
  });

  it('should award 500 points for slow answers (<=maxTime)', () => {
    expect(calculatePoints(10, 15)).toBe(500);
    expect(calculatePoints(15, 15)).toBe(500);
  });

  it('should award 0 points for overtime', () => {
    expect(calculatePoints(16, 15)).toBe(0);
  });
});
