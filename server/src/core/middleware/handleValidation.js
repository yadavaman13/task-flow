import { validationResult } from 'express-validator';

/**
 * Middleware: runs after express-validator chains.
 * If validation errors exist, responds with 400 and the error array.
 */
export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
          location: e.location,
        })),
      },
    });
  }
  next();
}
