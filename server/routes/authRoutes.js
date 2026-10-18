import { Router } from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController.js';
import { requireAuth, sanitizeUserUpdates } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();

router.post('/register', authLimiter, csrfProtection, register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, csrfProtection, resendVerification);
router.post('/login', authLimiter, csrfProtection, login);
router.post('/logout', requireAuth, csrfProtection, logout);
router.post('/forgot-password', authLimiter, csrfProtection, forgotPassword);
router.post('/reset-password', authLimiter, csrfProtection, resetPassword);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/me', requireAuth, csrfProtection, sanitizeUserUpdates, updateProfile);

export default router;
