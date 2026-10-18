import { Schema, model } from 'mongoose';

const ShortlistSchema = new Schema(
  {
    buyerRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    listingRefs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Shortlist = model('Shortlist', ShortlistSchema);
