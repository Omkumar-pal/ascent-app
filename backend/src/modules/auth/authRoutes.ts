import { Router } from 'express';
import { register, login, getMe } from './authController';
import { authenticateJwt } from '../../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJwt, getMe);

export default router;
