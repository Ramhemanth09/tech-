import { Router } from 'express';
import { getEvidenceAccessToken, streamEvidenceFile } from '../controllers/listingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Signed or authenticated streaming
router.get('/:evidenceId', requireAuth, getEvidenceAccessToken);
router.get('/:evidenceId/file', streamEvidenceFile);

export default router;
