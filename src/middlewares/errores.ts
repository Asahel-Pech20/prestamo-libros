import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/appError.js';

export const noEncontrado: RequestHandler = (_req, _res, next) =>
  next(new AppError('NOT_FOUND', 'La ruta no existe.'));

export const manejarErrores: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Revisa los datos enviados.',
        details: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
      },
    });
    return;
  }
  // JSON mal formado: express.json() lo marca con type 'entity.parse.failed'
  if (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    err.type === 'entity.parse.failed'
  ) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'El JSON no es válido.' } });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error inesperado.' } });
};
