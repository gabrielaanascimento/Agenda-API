import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

export const adminService = {
  async listUsers(search) {
    return prisma.user.findMany({
      where: search
        ? {
            OR: [
              { nome: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { nome: 'asc' },
    });
  },

  async updateUserRole(targetUserId, newRole, requesterId) {
    if (!['ALUNO', 'ADM'].includes(newRole)) {
      throw new AppError('Cargo inválido. Escolha entre ALUNO ou ADM.', 400);
    }

    if (targetUserId === requesterId) {
      throw new AppError('Você não pode alterar seu próprio cargo de SUPER_ADMIN.', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
    });
  },
};
