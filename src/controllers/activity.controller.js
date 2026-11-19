import { z } from 'zod';
import { activityService } from '../services/activity.service.js';

const activitySchema = z.object({
  titulo: z.string().min(2, 'O título da atividade é obrigatório.'),
  descricao: z.string().optional().nullable(),
  tipo: z.enum(['PROVA', 'TRABALHO', 'LISTA', 'SEMINARIO', 'OUTRO']).optional(),
  dataEntrega: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de entrega inválida.',
  }),
  linkApoio: z.string().url('URL inválida.').optional().nullable().or(z.literal('')),
});

const updateActivitySchema = activitySchema.partial();

const calendarQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  subjectId: z.string().uuid().optional(),
});

export const activityController = {
  async create(req, res, next) {
    try {
      const data = activitySchema.parse(req.body);
      const activity = await activityService.createActivity(
        req.user.id,
        req.params.subjectId,
        data
      );
      return res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
  },

  async getCalendar(req, res, next) {
    try {
      const query = calendarQuerySchema.parse(req.query);
      const activities = await activityService.getCalendarActivities(req.user.id, query);
      return res.status(200).json(activities);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const data = updateActivitySchema.parse(req.body);
      const activity = await activityService.updateActivity(
        req.user.id,
        req.params.id,
        data
      );
      return res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await activityService.deleteActivity(req.user.id, req.params.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggleComplete(req, res, next) {
    try {
      const result = await activityService.toggleComplete(req.user.id, req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
