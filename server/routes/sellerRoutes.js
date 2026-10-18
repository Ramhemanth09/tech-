import { Router } from 'express';
import { getSellerListings } from '../controllers/listingController.js';
import {
  getSellerQuestions,
  answerQuestion,
  getSellerViewings,
} from '../controllers/buyerInteractionController.js';
import { requireAuth, requireVerifiedEmail, requireRole } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();

router.use(requireAuth, requireVerifiedEmail, requireRole('seller'));

router.get('/listings', getSellerListings);
router.get('/questions', getSellerQuestions);
router.patch('/questions/:questionId/answer', csrfProtection, answerQuestion);
router.get('/viewings', getSellerViewings);

export default router;
