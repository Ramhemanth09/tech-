import { Schema, model } from 'mongoose';

const ConversationSchema = new Schema(
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
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadByBuyer: {
      type: Number,
      default: 0,
    },
    unreadBySeller: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to prevent duplicate conversations for the same buyer + listing
ConversationSchema.index({ listingRef: 1, buyerRef: 1 }, { unique: true });

export const Conversation = model('Conversation', ConversationSchema);
