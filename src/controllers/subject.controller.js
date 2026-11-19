import { z } from 'zod';
import { subjectService } from '../services/subject.service.js';

const createSubjectSchema = z.object({
  nome: z.string().min(2, 'O nome da matéria é obrigatório.'),
  codigoDisciplina: z.string().optional(),
  semestre: z.string().min(4, 'Informe o semestre (ex: 2026.2).'),
  corHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor hexadecimal inválida.').optional(),
});

const joinSubjectSchema = z.object({
  codigoConvite: z.string().min(4, 'Informe o código de convite.'),
});

export const subjectController = {
  async create(req, res, next) {
    try {
      const data = createSubjectSchema.parse(req.body);
      const subject = await subjectService.createSubject(req.user.id, data);
      return res.status(201).json(subject);
    } catch (error) {
      next(error);
    }
  },

  async join(req, res, next) {
    try {
      const { codigoConvite } = joinSubjectSchema.parse(req.body);
      const subject = await subjectService.joinByInviteCode(req.user.id, codigoConvite);
      return res.status(200).json(subject);
    } catch (error) {
      next(error);
    }
  },

  async listMine(req, res, next) {
    try {
      const subjects = await subjectService.listMySubjects(req.user.id);
      return res.status(200).json(subjects);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const subject = await subjectService.getSubjectDetails(req.user.id, req.params.id);
      return res.status(200).json(subject);
    } catch (error) {
      next(error);
    }
  },

  async rotateInvite(req, res, next) {
    try {
      const result = await subjectService.rotateInviteCode(
        req.user.id,
        req.user.role,
        req.params.id
      );
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req, res, next) {
    try {
      await subjectService.removeMember(
        req.user.id,
        req.user.role,
        req.params.id,
        req.params.userId
      );
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
