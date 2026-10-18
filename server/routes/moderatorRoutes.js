import { Router } from 'express';
import {
  getSubmittedListingsQueue,
  getReportedListingsQueue,
  moderateListing,
  getModerationAuditHistory,
  getListingInspection,
} from '../controllers/moderatorController.js';
import { requireAuth, requireModerator } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();

// Strict RBAC: All moderator routes require authenticated moderator
router.use(requireAuth, requireModerator);

router.get('/queue/submitted', getSubmittedListingsQueue);
router.get('/queue/reported', getReportedListingsQueue);
router.get('/inspect/:id', getListingInspection);
router.post('/listings/:id/moderation', csrfProtection, moderateListing);
router.get('/audit-history', getModerationAuditHistory);

export default router;
