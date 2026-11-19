import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export const subjectService = {
  async createSubject(userId, { nome, codigoDisciplina, semestre, corHex }) {
    const codigoConvite = generateInviteCode();

    // Cria a matéria e já insere o ADM criador como primeiro participante
    return prisma.$transaction(async (tx) => {
      const subject = await tx.subject.create({
        data: {
          nome,
          codigoDisciplina,
          semestre,
          corHex: corHex || '#3B82F6',
          codigoConvite,
          criadoPorId: userId,
        },
      });

      await tx.subjectMember.create({
        data: {
          userId,
          subjectId: subject.id,
        },
      });

      return subject;
    });
  },

  async joinByInviteCode(userId, codigoConvite) {
    const formattedCode = codigoConvite.trim().toUpperCase();

    const subject = await prisma.subject.findUnique({
      where: { codigoConvite: formattedCode },
    });

    if (!subject) {
      throw new AppError('Código de convite inválido ou expirado.', 404);
    }

    const alreadyMember = await prisma.subjectMember.findUnique({
      where: {
        userId_subjectId: {
          userId,
          subjectId: subject.id,
        },
      },
    });

    if (alreadyMember) {
      throw new AppError('Você já está participando desta matéria.', 409);
    }

    await prisma.subjectMember.create({
      data: {
        userId,
        subjectId: subject.id,
      },
    });

    return subject;
  },

  async listMySubjects(userId) {
    const memberships = await prisma.subjectMember.findMany({
      where: { userId },
      include: {
        subject: {
          include: {
            criadoPor: {
              select: { id: true, nome: true },
            },
            _count: {
              select: { members: true, activities: true },
            },
          },
        },
      },
      orderBy: { entrouEm: 'desc' },
    });

    return memberships.map((m) => m.subject);
  },

  async getSubjectDetails(userId, subjectId) {
    const membership = await prisma.subjectMember.findUnique({
      where: {
        userId_subjectId: { userId, subjectId },
      },
    });

    if (!membership) {
      throw new AppError('Você não tem acesso a esta matéria.', 403);
    }

    return prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        criadoPor: { select: { id: true, nome: true } },
        members: {
          include: {
            user: {
              select: { id: true, nome: true, email: true, role: true },
            },
          },
          orderBy: { entrouEm: 'asc' },
        },
      },
    });
  },

  async rotateInviteCode(requesterId, requesterRole, subjectId) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new AppError('Matéria não encontrada.', 404);
    }

    if (subject.criadoPorId !== requesterId && requesterRole !== 'SUPER_ADMIN') {
      throw new AppError('Apenas o ADM criador da matéria pode gerar um novo convite.', 403);
    }

    const novoCodigo = generateInviteCode();

    return prisma.subject.update({
      where: { id: subjectId },
      data: { codigoConvite: novoCodigo },
      select: { id: true, nome: true, codigoConvite: true },
    });
  },

  async removeMember(requesterId, requesterRole, subjectId, targetUserId) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new AppError('Matéria não encontrada.', 404);
    }

    const isSelfLeaving = requesterId === targetUserId;
    const isSubjectOwner = subject.criadoPorId === requesterId;
    const isSuperAdmin = requesterRole === 'SUPER_ADMIN';

    if (!isSelfLeaving && !isSubjectOwner && !isSuperAdmin) {
      throw new AppError('Você não tem permissão para remover este participante.', 403);
    }

    const membership = await prisma.subjectMember.findUnique({
      where: {
        userId_subjectId: { userId: targetUserId, subjectId },
      },
    });

    if (!membership) {
      throw new AppError('Participante não encontrado nesta matéria.', 404);
    }

    await prisma.subjectMember.delete({
      where: {
        userId_subjectId: { userId: targetUserId, subjectId },
      },
    });
  },
};
