import { Listing } from '../models/Listing.js';
import { ListingReport } from '../models/ListingReport.js';
import { ModerationEvent } from '../models/ModerationEvent.js';
import { PrivateEvidence } from '../models/PrivateEvidence.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

/**
 * Queue: Submitted listings awaiting review
 */
export async function getSubmittedListingsQueue(req, res, next) {
  try {
    const listings = await Listing.find({ status: 'submitted' })
      .populate('sellerRef', 'name email reputationScore')
      .sort({ createdAt: 1 });

    return successResponse(res, listings);
  } catch (error) {
    next(error);
  }
}

/**
 * Queue: Reported listings queue
 */
export async function getReportedListingsQueue(req, res, next) {
  try {
    const reports = await ListingReport.find({ status: { $in: ['pending', 'investigating'] } })
      .populate('reporterRef', 'name email')
      .populate({
        path: 'listingRef',
        populate: { path: 'sellerRef', select: 'name email reputationScore' },
      })
      .sort({ createdAt: -1 });

    return successResponse(res, reports);
  } catch (error) {
    next(error);
  }
}

/**
 * Moderator: Take Action on Listing (Approve, Reject, Suspend, Verify Evidence)
 * Appends immutable record in ModerationEvent
 */
export async function moderateListing(req, res, next) {
  try {
    const { id: listingId } = req.params;
    const { decision, reason, evidenceRefs = [], reportId } = req.body;

    const validDecisions = [
      'approved',
      'rejected',
      'suspended',
      'active',
      'flagged_inconsistent',
      'evidence_verified',
      'evidence_rejected',
    ];

    if (!validDecisions.includes(decision)) {
      return errorResponse(res, `Invalid decision. Allowed: [${validDecisions.join(', ')}]`, 400);
    }

    if (!reason || reason.trim().length < 5) {
      return errorResponse(res, 'A clear reason / explanation is required for moderation auditability', 400);
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    const previousStatus = listing.status;

    // Apply status change based on decision
    if (decision === 'approved') {
      listing.status = 'active'; // Approved listings move to active
    } else if (decision === 'rejected') {
      listing.status = 'rejected';
    } else if (decision === 'suspended') {
      listing.status = 'suspended';
    } else if (decision === 'active') {
      listing.status = 'active';
    }

    // Handle evidence status updates
    if (decision === 'evidence_verified') {
      listing.evidenceStatus = 'verified';
      await PrivateEvidence.updateMany(
        { listingRef: listing._id },
        { verificationStatus: 'verified', verifiedBy: req.user._id, moderatorNotes: reason }
      );
    } else if (decision === 'evidence_rejected') {
      listing.evidenceStatus = 'rejected';
      await PrivateEvidence.updateMany(
        { listingRef: listing._id },
        { verificationStatus: 'rejected', verifiedBy: req.user._id, moderatorNotes: reason }
      );
    }

    await listing.save();

    // Append-only moderation event
    const event = await ModerationEvent.create({
      moderatorRef: req.user._id,
      listingRef: listing._id,
      decision,
      reason: reason.trim(),
      evidenceRefs,
      metadata: {
        previousStatus,
        newStatus: listing.status,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // If linked to a report, update report status
    if (reportId) {
      await ListingReport.findByIdAndUpdate(reportId, {
        status: 'resolved_action_taken',
        resolvedBy: req.user._id,
        resolutionNotes: `Action '${decision}': ${reason}`,
      });
    }

    return successResponse(
      res,
      {
        message: `Moderation action '${decision}' recorded successfully.`,
        listing,
        event,
      },
      {},
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Moderator Audit Log / History
 */
export async function getModerationAuditHistory(req, res, next) {
  try {
    const { listingId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (listingId) filter.listingRef = listingId;

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      ModerationEvent.find(filter)
        .populate('moderatorRef', 'name email')
        .populate('listingRef', 'title brand modelName category status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ModerationEvent.countDocuments(filter),
    ]);

    return successResponse(res, events, { total, page: Number(page) });
  } catch (error) {
    next(error);
  }
}

/**
 * Inspection view of a listing including private evidence for review
 */
export async function getListingInspection(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id).populate('sellerRef', 'name email reputationScore');
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    const evidenceRecords = await PrivateEvidence.find({ listingRef: listing._id });
    const reports = await ListingReport.find({ listingRef: listing._id }).populate('reporterRef', 'name');
    const pastAuditEvents = await ModerationEvent.find({ listingRef: listing._id }).populate('moderatorRef', 'name');

    return successResponse(res, {
      listing,
      evidenceRecords,
      reports,
      pastAuditEvents,
    });
  } catch (error) {
    next(error);
  }
}
