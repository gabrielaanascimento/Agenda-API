import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'validation_error',
      errors: err.errors.map((e) => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      })),
    });
  }

  // Erro de registro duplicado no Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: 'Já existe um registro com esses dados únicos.',
    });
  }

  console.error('Erro interno:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor.',
  });
}
