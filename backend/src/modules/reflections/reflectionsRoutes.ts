import { Router } from 'express';
import { getWeeklyReflectionSummary, saveWeeklyReflection } from './reflectionsController';
import { authenticateJwt } from '../../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/summary', getWeeklyReflectionSummary);
router.post('/', saveWeeklyReflection);

export default router;
