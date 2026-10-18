import { Schema, model } from 'mongoose';

const ListingReportSchema = new Schema(
  {
    reporterRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listingRef: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      enum: [
        'misleading_specifications',
        'undisclosed_major_defect',
        'suspicious_pricing_or_scam',
        'inconsistent_evidence',
        'counterfeit_or_unauthorized',
        'other',
      ],
    },
    details: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved_action_taken', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ListingReport = model('ListingReport', ListingReportSchema);
