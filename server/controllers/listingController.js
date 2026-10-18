import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { Listing, ALLOWED_TRANSITIONS } from '../models/Listing.js';
import { PrivateEvidence } from '../models/PrivateEvidence.js';
import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import {
  validateMagicBytes,
  maskSerialNumber,
  generateSecureFilePath,
  generateSignedAccessToken,
  verifySignedAccessToken,
} from '../services/evidence/evidenceStorage.js';

// Listing validation schema
const listingInputSchema = z.object({
  title: z.string().min(5).max(200),
  category: z.enum(['laptop', 'camera', 'gaming_device']),
  brand: z.string().min(1),
  modelName: z.string().min(1),
  askingPrice: z.number().positive(),
  currency: z.string().default('INR'),
  generalCondition: z.enum(['like_new', 'excellent', 'good', 'fair']),
  detailedConditionDescription: z.string().min(10),
  knownDefects: z.array(z.string()).default([]),
  repairHistory: z
    .array(
      z.object({
        description: z.string(),
        date: z.string().optional(),
        performedBy: z.string().optional(),
      })
    )
    .default([]),
  includedAccessories: z.array(z.string()).default([]),
  purchaseDate: z.string().optional(),
  usageHistory: z.string().optional(),
  specifications: z.record(z.any()).default({}),
  supportedUpgrades: z.array(z.string()).default([]),
  compatibilityInfo: z.string().default(''),
  images: z.array(z.string()).default([]),
  sellerOwnershipDeclaration: z.boolean().default(false),
  location: z
    .object({
      city: z.string().default('Bangalore'),
      state: z.string().default('Karnataka'),
    })
    .default({}),
});

/**
 * Public Listing Search & Discovery
 * Strict rule: only approved + active listings appear.
 */
export async function getPublicListings(req, res, next) {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      condition,
      minRam,
      city,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      status: 'active', // Public visibility strictly requires active approved status
    };

    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (condition) query.generalCondition = condition;
    if (city) query['location.city'] = new RegExp(city, 'i');

    if (minPrice || maxPrice) {
      query.askingPrice = {};
      if (minPrice) query.askingPrice.$gte = Number(minPrice);
      if (maxPrice) query.askingPrice.$lte = Number(maxPrice);
    }

    if (minRam) {
      query['specifications.ramGb'] = { $gte: Number(minRam) };
    }

    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const sortOptions = {};
    if (sort === 'price_asc') sortOptions.askingPrice = 1;
    else if (sort === 'price_desc') sortOptions.askingPrice = -1;
    else sortOptions.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, totalCount] = await Promise.all([
      Listing.find(query).sort(sortOptions).skip(skip).limit(Number(limit)),
      Listing.countDocuments(query),
    ]);

    // Fetch seller summaries for public cards
    const sellerIds = [...new Set(listings.map((l) => l.sellerRef.toString()))];
    const sellers = await User.find({ _id: { $in: sellerIds } });
    const sellerMap = new Map(
      sellers.map((s) => [
        s._id.toString(),
        {
          id: s._id,
          name: s.name,
          reputationScore: s.reputationScore,
          successfulSalesCount: s.successfulSalesCount,
        },
      ])
    );

    const publicListings = listings.map((l) =>
      l.toPublicListing(sellerMap.get(l.sellerRef.toString()) || null)
    );

    return successResponse(
      res,
      publicListings,
      {
        total: totalCount,
        page: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Public Listing Detail
 * Shows seller claims, evidence status, and seller reputation.
 * Hides serials and private documents.
 */
export async function getListingById(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404);
    }

    // Access control: if not active, only seller or moderator can view
    const isOwner = req.session?.userId && listing.sellerRef.toString() === req.session.userId;
    const isModerator = req.session?.userRole === 'moderator';

    if (listing.status !== 'active' && !isOwner && !isModerator) {
      return errorResponse(res, 'This listing is not currently active.', 403);
    }

    const seller = await User.findById(listing.sellerRef);
    const sellerSummary = seller
      ? {
          id: seller._id,
          name: seller.name,
          reputationScore: seller.reputationScore,
          successfulSalesCount: seller.successfulSalesCount,
          memberSince: seller.createdAt,
        }
      : null;

    // Fetch safe evidence summary
    const evidenceList = await PrivateEvidence.find({ listingRef: listing._id });
    const safeEvidence = evidenceList.map((e) => e.toSafeEvidenceJSON());

    // Increment view count asynchronously
    listing.viewsCount = (listing.viewsCount || 0) + 1;
    listing.save().catch(() => {});

    return successResponse(res, {
      ...listing.toPublicListing(sellerSummary),
      evidenceRecords: safeEvidence,
      viewsCount: listing.viewsCount,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Seller: Create Listing
 */
export async function createListing(req, res, next) {
  try {
    const parseResult = listingInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, 'Invalid listing fields', 400, parseResult.error.format());
    }

    const newListing = await Listing.create({
      ...parseResult.data,
      sellerRef: req.user._id,
      status: 'draft',
      evidenceStatus: 'none',
    });

    return successResponse(res, newListing, {}, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Seller: List own listings
 */
export async function getSellerListings(req, res, next) {
  try {
    const listings = await Listing.find({ sellerRef: req.user._id }).sort({ updatedAt: -1 });
    return successResponse(res, listings);
  } catch (error) {
    next(error);
  }
}

/**
 * Seller: Update Listing
 * Enforces ownership check and state transition rules.
 */
export async function updateListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return errorResponse(res, 'Listing not found', 404);
    }

    // Ownership check (IDOR defense)
    if (listing.sellerRef.toString() !== req.user._id.toString() && req.user.role !== 'moderator') {
      return errorResponse(res, 'You do not have permission to modify this listing.', 403);
    }

    const updates = req.body;

    // Prevent changing sellerRef
    delete updates.sellerRef;

    // Enforce status transitions
    if (updates.status && updates.status !== listing.status) {
      const allowed = ALLOWED_TRANSITIONS[listing.status] || [];
      if (!allowed.includes(updates.status)) {
        return errorResponse(
          res,
          `Invalid status transition from '${listing.status}' to '${updates.status}'. Allowed: [${allowed.join(', ')}]`,
          400
        );
      }

      // Sellers CANNOT move listing to 'approved', 'active', or 'suspended' directly
      if (req.user.role !== 'moderator' && ['approved', 'active', 'suspended'].includes(updates.status)) {
        return errorResponse(res, 'Only moderators can approve or suspend listings.', 403);
      }
    }

    Object.assign(listing, updates);
    await listing.save();

    return successResponse(res, listing);
  } catch (error) {
    next(error);
  }
}

/**
 * Seller: Submit Listing for Review
 */
export async function submitForReview(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    if (listing.sellerRef.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    if (listing.status !== 'draft') {
      return errorResponse(res, `Only draft listings can be submitted. Current status: ${listing.status}`, 400);
    }

    listing.status = 'submitted';
    await listing.save();

    return successResponse(res, { message: 'Listing submitted for moderator review', listing });
  } catch (error) {
    next(error);
  }
}

/**
 * Seller: Withdraw Listing
 */
export async function withdrawListing(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    if (listing.sellerRef.toString() !== req.user._id.toString() && req.user.role !== 'moderator') {
      return errorResponse(res, 'Unauthorized', 403);
    }

    listing.status = 'withdrawn';
    await listing.save();

    return successResponse(res, { message: 'Listing withdrawn successfully', listing });
  } catch (error) {
    next(error);
  }
}

/**
 * Seller: Upload Private Evidence Document
 * Strict validation: MIME, Extension, Magic Bytes, Size, Serial Masking
 */
export async function uploadEvidence(req, res, next) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return errorResponse(res, 'Listing not found', 404);

    if (listing.sellerRef.toString() !== req.user._id.toString() && req.user.role !== 'moderator') {
      return errorResponse(res, 'Unauthorized to add evidence to this listing', 403);
    }

    if (!req.file) {
      return errorResponse(res, 'File upload is required', 400);
    }

    const { documentType = 'other', serialNumber = '' } = req.body;
    const originalExt = path.extname(req.file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];

    if (!allowedExts.includes(originalExt)) {
      return errorResponse(res, 'Unsupported file format. Only PDF, PNG, and JPG are accepted.', 400);
    }

    // Magic bytes verification
    const isValidSignature = validateMagicBytes(req.file.buffer, originalExt);
    if (!isValidSignature) {
      return errorResponse(res, 'File content does not match its claimed file extension.', 400);
    }

    // Save securely on disk
    const targetPath = generateSecureFilePath(req.file.originalname);
    fs.writeFileSync(targetPath, req.file.buffer);

    const maskedSerial = maskSerialNumber(serialNumber);

    const evidence = await PrivateEvidence.create({
      listingRef: listing._id,
      sellerRef: req.user._id,
      documentType,
      originalFileName: req.file.originalname,
      storedFilePath: targetPath,
      mimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      fullSerialNumber: serialNumber.trim(),
      maskedSerialNumber: maskedSerial,
      verificationStatus: 'unverified',
    });

    // Update listing evidence status
    listing.evidenceStatus = 'pending_review';
    await listing.save();

    return successResponse(
      res,
      {
        message: 'Evidence document uploaded securely for review.',
        evidence: evidence.toSafeEvidenceJSON(),
      },
      {},
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Private Evidence Access Request
 * Produces short-lived signed access token for authorized users (uploader or moderator)
 */
export async function getEvidenceAccessToken(req, res, next) {
  try {
    const evidence = await PrivateEvidence.findById(req.params.evidenceId);
    if (!evidence) return errorResponse(res, 'Evidence not found', 404);

    const isOwner = evidence.sellerRef.toString() === req.user._id.toString();
    const isModerator = req.user.role === 'moderator';

    if (!isOwner && !isModerator) {
      return errorResponse(res, 'Access denied. You do not have permission to view this evidence document.', 403);
    }

    const token = generateSignedAccessToken(evidence._id, req.user._id);
    const downloadUrl = `/api/evidence/${evidence._id}/file?token=${token}&userId=${req.user._id}`;

    return successResponse(res, {
      evidence: isModerator
        ? { ...evidence.toObject(), storedFilePath: undefined }
        : evidence.toSafeEvidenceJSON(),
      signedUrl: downloadUrl,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Stream Protected Evidence File
 */
export async function streamEvidenceFile(req, res, next) {
  try {
    const { token, userId } = req.query;
    const evidence = await PrivateEvidence.findById(req.params.evidenceId);
    if (!evidence) return errorResponse(res, 'Evidence document not found', 404);

    const validSigned = token && userId && verifySignedAccessToken(token, evidence._id, userId);
    const isSessionUser = req.session?.userId && (
      req.session.userId === evidence.sellerRef.toString() ||
      req.session.userRole === 'moderator'
    );

    if (!validSigned && !isSessionUser) {
      return errorResponse(res, 'Unauthorized or expired access token', 403);
    }

    if (!fs.existsSync(evidence.storedFilePath)) {
      return errorResponse(res, 'Evidence file unavailable on storage server', 404);
    }

    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${evidence.originalFileName}"`);
    fs.createReadStream(evidence.storedFilePath).pipe(res);
  } catch (error) {
    next(error);
  }
}
