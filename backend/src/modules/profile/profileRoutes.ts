import { Router } from 'express';
import { getProfile, updateProfile, updateNotifications } from './profileController';
import { authenticateJwt } from '../../middleware/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/notifications', updateNotifications);

export default router;
