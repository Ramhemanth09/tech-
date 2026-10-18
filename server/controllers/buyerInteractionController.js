import { Shortlist } from '../models/Shortlist.js';
import { Question } from '../models/Question.js';
import { Viewing } from '../models/Viewing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Listing } from '../models/Listing.js';
import { ListingReport } from '../models/ListingReport.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

/**
 * Shortlist Management
 */
export async function getShortlist(req, res, next) {
  try {
    let shortlist = await Shortlist.findOne({ buyerRef: req.user._id }).populate({
      path: 'listingRefs',
      match: { status: 'active' }, // only show active listings in shortlist
    });

    if (!shortlist) {
      shortlist = await Shortlist.create({ buyerRef: req.user._id, listingRefs: [] });
    }

    return successResponse(res, shortlist.listingRefs);
  } catch (error) {
    next(error);
  }
}

export async function toggleShortlist(req, res, next) {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      return errorResponse(res, 'listingId is required', 400);
    }

    let shortlist = await Shortlist.findOne({ buyerRef: req.user._id });
    if (!shortlist) {
      shortlist = await Shortlist.create({ buyerRef: req.user._id, listingRefs: [] });
    }

    const index = shortlist.listingRefs.findIndex((id) => id.toString() === listingId);
    let action = 'added';

    if (index > -1) {
      shortlist.listingRefs.splice(index, 1);
      action = 'removed';
    } else {
      shortlist.listingRefs.push(listingId);
    }

    await shortlist.save();
    return successResponse(res, { action, listingId, total: shortlist.listingRefs.length });
  } catch (error) {
    next(error);
  }
}

/**
 * Questions & Answers
 */
export async function askQuestion(req, res, next) {
  try {
    const { questionText } = req.body;
    const { id: listingId } = req.params;

    if (!questionText || questionText.trim().length < 5) {
      return errorResponse(res, 'Question text must be at least 5 characters', 400);
    }

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== 'active') {
      return errorResponse(res, 'Cannot ask questions on inactive or suspended listings', 400);
    }

    const question = await Question.create({
      listingRef: listing._id,
      buyerRef: req.user._id,
      sellerRef: listing.sellerRef,
      questionText: questionText.trim(),
    });

    return successResponse(res, question, {}, 201);
  } catch (error) {
    next(error);
  }
}

export async function getListingQuestions(req, res, next) {
  try {
    const { id: listingId } = req.params;
    const questions = await Question.find({ listingRef: listingId, isPublic: true })
      .populate('buyerRef', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, questions);
  } catch (error) {
    next(error);
  }
}

export async function getSellerQuestions(req, res, next) {
  try {
    const questions = await Question.find({ sellerRef: req.user._id })
      .populate('listingRef', 'title category askingPrice status')
      .populate('buyerRef', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, questions);
  } catch (error) {
    next(error);
  }
}

export async function answerQuestion(req, res, next) {
  try {
    const { answerText } = req.body;
    const { questionId } = req.params;

    if (!answerText || answerText.trim().length === 0) {
      return errorResponse(res, 'Answer text cannot be blank', 400);
    }

    const question = await Question.findById(questionId);
    if (!question) return errorResponse(res, 'Question not found', 404);

    // Verify ownership
    if (question.sellerRef.toString() !== req.user._id.toString() && req.user.role !== 'moderator') {
      return errorResponse(res, 'Unauthorized to answer this question', 403);
    }

    question.answerText = answerText.trim();
    question.answeredAt = new Date();
    await question.save();

    return successResponse(res, question);
  } catch (error) {
    next(error);
  }
}

/**
 * Viewings
 */
export async function requestViewing(req, res, next) {
  try {
    const { requestedSlot, locationPreference, notes } = req.body;
    const { id: listingId } = req.params;

    if (!requestedSlot || new Date(requestedSlot) < new Date()) {
      return errorResponse(res, 'Please specify a valid future date and time for viewing', 400);
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    // Strict rule: suspended or withdrawn listings CANNOT receive viewings
    if (['suspended', 'withdrawn', 'rejected', 'draft'].includes(listing.status)) {
      return errorResponse(res, `Cannot request viewing for listing with status: ${listing.status}`, 400);
    }

    // Buyer cannot book viewing on their own listing
    if (listing.sellerRef.toString() === req.user._id.toString()) {
      return errorResponse(res, 'Cannot book viewing on your own listing', 400);
    }

    const viewing = await Viewing.create({
      listingRef: listing._id,
      buyerRef: req.user._id,
      sellerRef: listing.sellerRef,
      requestedSlot: new Date(requestedSlot),
      locationPreference: locationPreference || 'Public Tech Cafe',
      notes: notes || '',
      status: 'requested',
    });

    return successResponse(res, viewing, {}, 201);
  } catch (error) {
    next(error);
  }
}

export async function getBuyerViewings(req, res, next) {
  try {
    const viewings = await Viewing.find({ buyerRef: req.user._id })
      .populate('listingRef', 'title category askingPrice status images location')
      .populate('sellerRef', 'name email')
      .sort({ requestedSlot: -1 });

    return successResponse(res, viewings);
  } catch (error) {
    next(error);
  }
}

export async function getSellerViewings(req, res, next) {
  try {
    const viewings = await Viewing.find({ sellerRef: req.user._id })
      .populate('listingRef', 'title category askingPrice status')
      .populate('buyerRef', 'name email')
      .sort({ requestedSlot: -1 });

    return successResponse(res, viewings);
  } catch (error) {
    next(error);
  }
}

export async function updateViewingStatus(req, res, next) {
  try {
    const { status, cancellationReason } = req.body;
    const { viewingId } = req.params;

    const allowedStatuses = ['confirmed', 'declined', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`, 400);
    }

    const viewing = await Viewing.findById(viewingId);
    if (!viewing) return errorResponse(res, 'Viewing not found', 404);

    const isBuyer = viewing.buyerRef.toString() === req.user._id.toString();
    const isSeller = viewing.sellerRef.toString() === req.user._id.toString();
    const isModerator = req.user.role === 'moderator';

    if (!isBuyer && !isSeller && !isModerator) {
      return errorResponse(res, 'Unauthorized to alter this viewing', 403);
    }

    // Role-specific viewing transitions
    if (status === 'confirmed' || status === 'declined') {
      if (!isSeller && !isModerator) {
        return errorResponse(res, 'Only the seller can confirm or decline a viewing request', 403);
      }
    }

    viewing.status = status;
    if (cancellationReason) viewing.cancellationReason = cancellationReason;
    await viewing.save();

    return successResponse(res, viewing);
  } catch (error) {
    next(error);
  }
}

/**
 * Direct Conversations & Messages
 */
export async function getOrCreateConversation(req, res, next) {
  try {
    const { listingId } = req.body;
    if (!listingId) return errorResponse(res, 'listingId is required', 400);

    const listing = await Listing.findById(listingId);
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    let conversation = await Conversation.findOne({
      listingRef: listing._id,
      buyerRef: req.user._id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listingRef: listing._id,
        buyerRef: req.user._id,
        sellerRef: listing.sellerRef,
      });
    }

    return successResponse(res, conversation);
  } catch (error) {
    next(error);
  }
}

export async function getUserConversations(req, res, next) {
  try {
    const isBuyer = req.user.role === 'buyer';
    const query = isBuyer ? { buyerRef: req.user._id } : { sellerRef: req.user._id };

    const conversations = await Conversation.find(query)
      .populate('listingRef', 'title askingPrice category images status')
      .populate(isBuyer ? 'sellerRef' : 'buyerRef', 'name email reputationScore')
      .sort({ lastMessageAt: -1 });

    return successResponse(res, conversations);
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return errorResponse(res, 'Conversation not found', 404);

    const isAuthorized =
      conversation.buyerRef.toString() === req.user._id.toString() ||
      conversation.sellerRef.toString() === req.user._id.toString() ||
      req.user.role === 'moderator';

    if (!isAuthorized) {
      return errorResponse(res, 'Access denied to this conversation', 403);
    }

    const messages = await Message.find({ conversationRef: conversationId })
      .populate('senderRef', 'name role')
      .sort({ createdAt: 1 });

    return successResponse(res, messages);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 'Message content cannot be blank', 400);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return errorResponse(res, 'Conversation not found', 404);

    const isAuthorized =
      conversation.buyerRef.toString() === req.user._id.toString() ||
      conversation.sellerRef.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return errorResponse(res, 'You are not a participant in this conversation', 403);
    }

    const message = await Message.create({
      conversationRef: conversation._id,
      senderRef: req.user._id,
      content: content.trim(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return successResponse(res, message, {}, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Report a Listing
 */
export async function reportListing(req, res, next) {
  try {
    const { listingId, reason, details } = req.body;
    if (!listingId || !reason) {
      return errorResponse(res, 'listingId and reason are required', 400);
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    const report = await ListingReport.create({
      reporterRef: req.user._id,
      listingRef: listing._id,
      reason,
      details: details || '',
      status: 'pending',
    });

    return successResponse(res, { message: 'Listing reported for moderation review', report }, {}, 201);
  } catch (error) {
    next(error);
  }
}
