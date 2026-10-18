import { Router } from 'express';
import {
  getPublicListings,
  getListingById,
  createListing,
  getSellerListings,
  updateListing,
  submitForReview,
  withdrawListing,
  uploadEvidence,
} from '../controllers/listingController.js';
import { requireAuth, requireVerifiedEmail, requireRole } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public routes
router.get('/', getPublicListings);
router.get('/:id', getListingById);

// Seller routes
router.post('/', requireAuth, requireVerifiedEmail, requireRole('seller'), csrfProtection, createListing);
router.patch('/:id', requireAuth, requireVerifiedEmail, requireRole('seller', 'moderator'), csrfProtection, updateListing);
router.post('/:id/submit', requireAuth, requireVerifiedEmail, requireRole('seller'), csrfProtection, submitForReview);
router.post('/:id/withdraw', requireAuth, requireVerifiedEmail, requireRole('seller', 'moderator'), csrfProtection, withdrawListing);
router.post('/:id/evidence', requireAuth, requireVerifiedEmail, requireRole('seller', 'moderator'), upload.single('file'), uploadEvidence);

export default router;
