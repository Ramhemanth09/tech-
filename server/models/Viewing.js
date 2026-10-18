import { Schema, model } from 'mongoose';

const ViewingSchema = new Schema(
  {
    listingRef: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    buyerRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedSlot: {
      type: Date,
      required: [true, 'Requested viewing slot time is required'],
    },
    locationPreference: {
      type: String,
      default: 'Public Tech Cafe / Verifiable Public Meeting Spot',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'declined', 'cancelled', 'completed'],
      default: 'requested',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Viewing = model('Viewing', ViewingSchema);
