export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export class BadRequestError extends AppError {
  constructor(msg = 'Bad request') {
    super(msg, 400, 'BAD_REQUEST');
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Authentication required') {
    super(msg, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Access denied') {
    super(msg, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(msg = 'Resource already exists') {
    super(msg, 409, 'CONFLICT');
  }
}
