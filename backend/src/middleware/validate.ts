import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

type ValidationRule = {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: string[];
  message?: string;
};

export function validate(rules: ValidationRule[], source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const data = req[source] || {};

    for (const rule of rules) {
      const value = data[rule.field];

      if (value === undefined || value === null || value === '') {
        if (rule.required) {
          errors.push(rule.message || `${rule.field} is required`);
        }
        continue;
      }

      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${rule.field} must be a string`);
        continue;
      }
      if (rule.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${rule.field} must be a number`);
          continue;
        }
        if (rule.min !== undefined && num < rule.min) errors.push(`${rule.field} must be at least ${rule.min}`);
        if (rule.max !== undefined && num > rule.max) errors.push(`${rule.field} must be at most ${rule.max}`);
      }
      if (typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(rule.message || `${rule.field} format is invalid`);
        }
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
}

export function sanitize(str: string, maxLength: number = 1000): string {
  return str
    .replace(/[<>&"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
