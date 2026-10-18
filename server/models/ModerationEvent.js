import { Schema, model } from 'mongoose';

const ModerationEventSchema = new Schema(
  {
    moderatorRef: {
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
    decision: {
      type: String,
      enum: ['approved', 'rejected', 'suspended', 'flagged_inconsistent', 'evidence_verified', 'evidence_rejected'],
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Moderation reason or justification is required'],
      minlength: 5,
    },
    evidenceRefs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PrivateEvidence',
      },
    ],
    metadata: {
      previousStatus: String,
      newStatus: String,
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Append-only audit record
  }
);

export const ModerationEvent = model('ModerationEvent', ModerationEventSchema);
