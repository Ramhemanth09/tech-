import { Schema, model } from 'mongoose';

const QuestionSchema = new Schema(
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
    questionText: {
      type: String,
      required: [true, 'Question text cannot be empty'],
      maxlength: 1000,
    },
    answerText: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Question = model('Question', QuestionSchema);
