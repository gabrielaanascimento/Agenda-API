import { Router } from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/calendar', activityController.getCalendar);
router.patch('/:id', activityController.update);
router.delete('/:id', activityController.delete);
router.patch('/:id/complete', activityController.toggleComplete);

export default router;
