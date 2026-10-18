import { Router } from 'express';
import {
  getShortlist,
  toggleShortlist,
  askQuestion,
  getListingQuestions,
  requestViewing,
  getBuyerViewings,
  updateViewingStatus,
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  reportListing,
} from '../controllers/buyerInteractionController.js';
import { requireAuth, requireVerifiedEmail, requireRole } from '../middleware/auth.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { csrfProtection } from '../middleware/csrf.js';

const router = Router();

// Shortlists
router.get('/shortlist', requireAuth, requireRole('buyer'), getShortlist);
router.post('/shortlists', requireAuth, requireRole('buyer'), csrfProtection, toggleShortlist);

// Questions
router.post('/listings/:id/questions', requireAuth, requireVerifiedEmail, contactLimiter, csrfProtection, askQuestion);
router.get('/listings/:id/questions', getListingQuestions); // Publicly viewable Q&A

// Viewings
router.post('/listings/:id/viewings', requireAuth, requireVerifiedEmail, contactLimiter, csrfProtection, requestViewing);
router.get('/viewings', requireAuth, requireRole('buyer'), getBuyerViewings);
router.patch('/viewings/:viewingId/status', requireAuth, csrfProtection, updateViewingStatus);

// Conversations & Messages
router.post('/conversations', requireAuth, requireVerifiedEmail, csrfProtection, getOrCreateConversation);
router.get('/conversations', requireAuth, getUserConversations);
router.get('/conversations/:conversationId/messages', requireAuth, getMessages);
router.post('/conversations/:conversationId/messages', requireAuth, contactLimiter, csrfProtection, sendMessage);

// Reports
router.post('/reports', requireAuth, contactLimiter, csrfProtection, reportListing);

export default router;
