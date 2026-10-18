import { Schema, model } from 'mongoose';

const ChunkSchema = new Schema(
  {
    chunkId: {
      type: String,
      required: true,
    },
    passageText: {
      type: String,
      required: true,
    },
    sectionOrPage: {
      type: String,
      default: 'General',
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
  },
  { _id: false }
);

const DocumentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['manufacturer', 'reliable-technical', 'seller-provided'],
      required: true,
      index: true,
    },
    deviceCategory: {
      type: String,
      enum: ['laptop', 'camera', 'gaming_device', 'general'],
      default: 'general',
    },
    brand: {
      type: String,
      default: '',
    },
    modelName: {
      type: String,
      default: '',
    },
    sourceUrlOrId: {
      type: String,
      default: '',
    },
    accessPermissions: {
      type: String,
      enum: ['public', 'moderator_only', 'seller_private'],
      default: 'public',
      index: true,
    },
    chunks: [ChunkSchema],
  },
  {
    timestamps: true,
  }
);

// Compound text index for keyword fallback search
DocumentSchema.index({ title: 'text', 'chunks.passageText': 'text', brand: 'text', modelName: 'text' });

export const Document = model('Document', DocumentSchema);
