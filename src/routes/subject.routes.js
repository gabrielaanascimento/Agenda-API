import { Router } from 'express';
import { subjectController } from '../controllers/subject.controller.js';
import { activityController } from '../controllers/activity.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('ADM', 'SUPER_ADMIN'), subjectController.create);
router.post('/join', subjectController.join);
router.get('/', subjectController.listMine);
router.get('/:id', subjectController.getById);
router.patch('/:id/rotate-invite', authorizeRoles('ADM', 'SUPER_ADMIN'), subjectController.rotateInvite);
router.delete('/:id/members/:userId', subjectController.removeMember);

// Criar atividade dentro de uma matéria específica (aberto a qualquer membro)
router.post('/:subjectId/activities', activityController.create);

export default router;
