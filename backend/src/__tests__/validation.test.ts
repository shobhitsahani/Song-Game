import { describe, it, expect } from 'vitest';
import { sanitize } from '../middleware/validate';

describe('Input Sanitization', () => {
  it('should strip HTML tags', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
  });

  it('should trim whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello');
  });

  it('should collapse multiple spaces', () => {
    expect(sanitize('hello    world')).toBe('hello world');
  });

  it('should truncate to maxLength', () => {
    expect(sanitize('a'.repeat(100), 10)).toBe('a'.repeat(10));
  });
});
