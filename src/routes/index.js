import { Router } from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import subjectRoutes from './subject.routes.js';
import activityRoutes from './activity.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/subjects', subjectRoutes);
router.use('/activities', activityRoutes);

export default router;
