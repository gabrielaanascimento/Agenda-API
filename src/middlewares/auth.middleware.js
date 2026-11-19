import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação não fornecido.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário atualizado no banco para refletir mudanças de cargo em tempo real
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, role: true, nome: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado ou inválido.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Token inválido ou expirado.', 401));
    }
    next(error);
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Você não tem permissão para realizar esta ação.', 403));
    }
    next();
  };
}
