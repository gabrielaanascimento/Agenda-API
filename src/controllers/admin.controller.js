import { z } from 'zod';
import { adminService } from '../services/admin.service.js';

const updateRoleSchema = z.object({
  role: z.enum(['ALUNO', 'ADM']),
});

export const adminController = {
  async listUsers(req, res, next) {
    try {
      const { search } = req.query;
      const users = await adminService.listUsers(search);
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = updateRoleSchema.parse(req.body);
      const user = await adminService.updateUserRole(id, role, req.user.id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};
