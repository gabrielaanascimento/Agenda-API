import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate, authorizeRoles('SUPER_ADMIN'));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

export default router;
