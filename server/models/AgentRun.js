import { Schema, model } from 'mongoose';

const ToolExecutionSchema = new Schema(
  {
    toolName: { type: String, required: true },
    arguments: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['success', 'failed', 'fallback'], required: true },
    resultSummary: { type: String, default: '' },
    executionTimeMs: { type: Number, default: 0 },
  },
  { _id: false }
);

const CitationSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    documentTitle: { type: String, required: true },
    sourceType: { type: String, required: true },
    chunkId: { type: String, required: true },
    sectionOrPage: { type: String, default: '' },
    excerpt: { type: String, required: true },
  },
  { _id: false }
);

const AgentRunSchema = new Schema(
  {
    buyerRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    workflowState: {
      type: String,
      enum: ['started', 'evaluating', 'completed', 'failed_with_fallback'],
      default: 'started',
    },
    inputSummary: {
      useCase: String,
      budget: Number,
      currency: { type: String, default: 'INR' },
      rawPrompt: String,
    },
    candidateIds: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
    toolExecutions: [ToolExecutionSchema],
    result: {
      rankings: [Schema.Types.Mixed],
      tradeoffs: [String],
      missingDisclosures: [Schema.Types.Mixed],
      recommendedQuestions: [String],
      mode: { type: String, enum: ['ai', 'fallback'], default: 'ai' },
    },
    citations: [CitationSchema],
    errors: [String],
  },
  {
    timestamps: true,
  }
);

export const AgentRun = model('AgentRun', AgentRunSchema);
