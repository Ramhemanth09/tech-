import { Router } from 'express';
import { buyerChat, runComparisonAgent, getAgentRuns } from '../controllers/aiController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();

// Chat is accessible to everyone (authenticated buyers or guest shoppers)
router.post('/buyer-chat', optionalAuth, buyerChat);

// Comparison Agent is accessible to everyone (guest shoppers or authenticated buyers)
router.post('/comparison-agent', optionalAuth, runComparisonAgent);
router.get('/agent-runs', requireAuth, getAgentRuns);

export default router;
