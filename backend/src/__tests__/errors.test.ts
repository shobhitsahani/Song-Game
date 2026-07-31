import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  InternalError,
  BadRequestError,
} from '../utils/errors';

describe('AppError', () => {
  it('should create a basic error', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('should include optional details', () => {
    const details = { field: 'name' };
    const error = new AppError('Test', 400, 'TEST', details);
    expect(error.details).toEqual(details);
  });
});

describe('NotFoundError', () => {
  it('should create with entity name', () => {
    const error = new NotFoundError('User');
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('should create with entity name and id', () => {
    const error = new NotFoundError('User', '123');
    expect(error.message).toBe("User with id '123' not found");
  });
});

describe('ValidationError', () => {
  it('should create validation error', () => {
    const error = new ValidationError('Invalid input');
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});

describe('UnauthorizedError', () => {
  it('should create unauthorized error', () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe('Unauthorized');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });
});

describe('ForbiddenError', () => {
  it('should create forbidden error', () => {
    const error = new ForbiddenError();
    expect(error.message).toBe('Forbidden');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});

describe('ConflictError', () => {
  it('should create conflict error', () => {
    const error = new ConflictError('User already exists');
    expect(error.message).toBe('User already exists');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });
});

describe('RateLimitError', () => {
  it('should create rate limit error', () => {
    const error = new RateLimitError();
    expect(error.message).toBe('Too many requests');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});

describe('InternalError', () => {
  it('should create internal error', () => {
    const error = new InternalError();
    expect(error.message).toBe('Internal server error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
  });
});

describe('BadRequestError', () => {
  it('should create bad request error', () => {
    const error = new BadRequestError('Invalid parameter');
    expect(error.message).toBe('Invalid parameter');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });
});
