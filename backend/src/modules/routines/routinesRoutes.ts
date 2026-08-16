import { Router } from 'express';
import { getRoutines, updateRoutine } from './routinesController';
import { authenticateJwt } from '../../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/', getRoutines);
router.put('/:id', updateRoutine);

export default router;
