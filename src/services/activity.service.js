import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

async function ensureSubjectMembership(userId, subjectId) {
  const membership = await prisma.subjectMember.findUnique({
    where: {
      userId_subjectId: { userId, subjectId },
    },
  });

  if (!membership) {
    throw new AppError('Você precisa ser membro desta matéria para realizar esta ação.', 403);
  }
}

export const activityService = {
  async createActivity(userId, subjectId, { titulo, descricao, tipo, dataEntrega, linkApoio }) {
    await ensureSubjectMembership(userId, subjectId);

    return prisma.activity.create({
      data: {
        subjectId,
        titulo,
        descricao,
        tipo: tipo || 'TRABALHO',
        dataEntrega: new Date(dataEntrega),
        linkApoio,
        criadoPorId: userId,
      },
      include: {
        subject: { select: { id: true, nome: true, corHex: true } },
        criadoPor: { select: { id: true, nome: true } },
      },
    });
  },

  async getCalendarActivities(userId, { month, year, subjectId }) {
    let subjectIds = [];

    if (subjectId) {
      await ensureSubjectMembership(userId, subjectId);
      subjectIds = [subjectId];
    } else {
      const memberships = await prisma.subjectMember.findMany({
        where: { userId },
        select: { subjectId: true },
      });
      subjectIds = memberships.map((m) => m.subjectId);
    }

    if (subjectIds.length === 0) {
      return [];
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const activities = await prisma.activity.findMany({
      where: {
        subjectId: { in: subjectIds },
        dataEntrega: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        subject: {
          select: { id: true, nome: true, codigoDisciplina: true, corHex: true },
        },
        criadoPor: {
          select: { id: true, nome: true },
        },
        atualizadoPor: {
          select: { id: true, nome: true },
        },
        completions: {
          where: { userId },
          select: { concluidaEm: true },
        },
      },
      orderBy: { dataEntrega: 'asc' },
    });

    return activities.map(({ completions, ...activity }) => ({
      ...activity,
      concluida: completions.length > 0,
      concluidaEm: completions[0]?.concluidaEm || null,
    }));
  },

  async updateActivity(userId, activityId, data) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada.', 404);
    }

    // Qualquer membro da matéria pode editar a tarefa
    await ensureSubjectMembership(userId, activity.subjectId);

    const updatePayload = {
      atualizadoPorId: userId,
    };

    if (data.titulo !== undefined) updatePayload.titulo = data.titulo;
    if (data.descricao !== undefined) updatePayload.descricao = data.descricao;
    if (data.tipo !== undefined) updatePayload.tipo = data.tipo;
    if (data.dataEntrega !== undefined) updatePayload.dataEntrega = new Date(data.dataEntrega);
    if (data.linkApoio !== undefined) updatePayload.linkApoio = data.linkApoio;

    return prisma.activity.update({
      where: { id: activityId },
      data: updatePayload,
      include: {
        subject: { select: { id: true, nome: true, corHex: true } },
        criadoPor: { select: { id: true, nome: true } },
        atualizadoPor: { select: { id: true, nome: true } },
      },
    });
  },

  async deleteActivity(userId, activityId) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada.', 404);
    }

    // Qualquer membro da matéria pode apagar a tarefa
    await ensureSubjectMembership(userId, activity.subjectId);

    await prisma.activity.delete({
      where: { id: activityId },
    });
  },

  async toggleComplete(userId, activityId) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new AppError('Atividade não encontrada.', 404);
    }

    await ensureSubjectMembership(userId, activity.subjectId);

    const existing = await prisma.activityCompletion.findUnique({
      where: {
        userId_activityId: { userId, activityId },
      },
    });

    if (existing) {
      await prisma.activityCompletion.delete({
        where: { userId_activityId: { userId, activityId } },
      });
      return { activityId, concluida: false };
    }

    await prisma.activityCompletion.create({
      data: { userId, activityId },
    });
    return { activityId, concluida: true };
  },
};
