import { Router } from 'express';
import { getTodayDashboard } from './dashboardController';
import { authenticateJwt } from '../../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/today', getTodayDashboard);

export default router;
