import { Schema, model } from 'mongoose';

const PrivateEvidenceSchema = new Schema(
  {
    listingRef: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    sellerRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['purchase_invoice', 'warranty_card', 'service_receipt', 'battery_diagnostic_report', 'ownership_affidavit', 'other'],
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFilePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    // Sensitive serial number is masked by default
    fullSerialNumber: {
      type: String,
      default: '',
    },
    maskedSerialNumber: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'rejected', 'inconclusive'],
      default: 'unverified',
    },
    moderatorNotes: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Never expose fullSerialNumber or internal storedFilePath in standard serialization
PrivateEvidenceSchema.methods.toSafeEvidenceJSON = function () {
  return {
    id: this._id,
    listingRef: this.listingRef,
    documentType: this.documentType,
    originalFileName: this.originalFileName,
    mimeType: this.mimeType,
    fileSizeBytes: this.fileSizeBytes,
    maskedSerialNumber: this.maskedSerialNumber || (this.fullSerialNumber ? `••••-••••-${this.fullSerialNumber.slice(-4)}` : 'N/A'),
    verificationStatus: this.verificationStatus,
    createdAt: this.createdAt,
  };
};

export const PrivateEvidence = model('PrivateEvidence', PrivateEvidenceSchema);
