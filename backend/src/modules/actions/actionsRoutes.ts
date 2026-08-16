import { Router } from 'express';
import { createAction, completeAction, skipAction, updateAction, deleteAction } from './actionsController';
import { authenticateJwt } from '../../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.post('/', createAction);
router.post('/:id/complete', completeAction);
router.post('/:id/skip', skipAction);
router.put('/:id', updateAction);
router.delete('/:id', deleteAction);

export default router;
