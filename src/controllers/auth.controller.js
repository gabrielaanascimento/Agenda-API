import { z } from 'zod';
import { authService } from '../services/auth.service.js';

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  telefone: z.string().min(10, 'Informe um número de telefone válido com DDD.'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(1, 'A senha é obrigatória.'),
});

const updateProfileSchema = z.object({
  nome: z.string().min(2).optional(),
  telefone: z.string().min(10).optional(),
  senhaAtual: z.string().optional(),
  novaSenha: z.string().min(6).optional(),
});

export const authController = {
  async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req, res, next) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const updatedUser = await authService.updateProfile(req.user.id, data);
      return res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  },
};
