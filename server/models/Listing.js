import { Schema, model } from 'mongoose';

const SpecificationSchema = new Schema(
  {
    // Common specs
    processor: { type: String, default: '' },
    ramGb: { type: Number, default: 0 },
    storageGb: { type: Number, default: 0 },
    storageType: { type: String, default: '' }, // SSD, NVMe, HDD

    // Laptop specific
    cpu: { type: String, default: '' },
    gpu: { type: String, default: '' },
    screenSize: { type: String, default: '' },
    screenResolution: { type: String, default: '' },
    batteryHealthPercent: { type: Number, default: null }, // Nullable if undisclosed!
    batteryCycleCount: { type: Number, default: null },
    ports: [{ type: String }],
    upgradeableRam: { type: Boolean, default: null },
    upgradeableStorage: { type: Boolean, default: null },

    // Camera specific
    sensorType: { type: String, default: '' },
    resolutionMp: { type: Number, default: 0 },
    lensMount: { type: String, default: '' },
    shutterCount: { type: Number, default: null },
    videoRecording4k: { type: Boolean, default: null },

    // Gaming device specific
    platform: { type: String, default: '' }, // PS5, Xbox Series X, Nintendo Switch, Steam Deck
    controllerIncluded: { type: Boolean, default: true },
    firmwareVersion: { type: String, default: '' },
  },
  { _id: false }
);

const ListingSchema = new Schema(
  {
    sellerRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: ['laptop', 'camera', 'gaming_device'],
      required: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    askingPrice: {
      type: Number,
      required: [true, 'Asking price is required'],
      min: [1, 'Price must be positive'],
      index: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    generalCondition: {
      type: String,
      enum: ['like_new', 'excellent', 'good', 'fair'],
      required: true,
      index: true,
    },
    detailedConditionDescription: {
      type: String,
      required: true,
    },
    knownDefects: [{ type: String }],
    repairHistory: [
      {
        description: String,
        date: String,
        performedBy: String,
      },
    ],
    includedAccessories: [{ type: String }],
    purchaseDate: {
      type: Date,
      default: null,
    },
    usageHistory: {
      type: String,
      default: '',
    },
    specifications: {
      type: SpecificationSchema,
      default: () => ({}),
    },
    supportedUpgrades: [{ type: String }],
    compatibilityInfo: {
      type: String,
      default: '',
    },
    images: [{ type: String }],
    sellerOwnershipDeclaration: {
      type: Boolean,
      default: false,
    },
    evidenceStatus: {
      type: String,
      enum: ['none', 'pending_review', 'verified', 'rejected'],
      default: 'none',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'active', 'withdrawn', 'rejected', 'suspended'],
      default: 'draft',
      index: true,
    },
    location: {
      city: { type: String, default: 'Bangalore' },
      state: { type: String, default: 'Karnataka' },
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid public queries
ListingSchema.index({ status: 1, category: 1, askingPrice: 1 });
ListingSchema.index({ status: 1, 'specifications.ramGb': 1 });
ListingSchema.index({ title: 'text', brand: 'text', modelName: 'text', detailedConditionDescription: 'text' });

// Lifecycle transition rule map
export const ALLOWED_TRANSITIONS = {
  draft: ['submitted', 'withdrawn'],
  submitted: ['approved', 'rejected', 'withdrawn'],
  approved: ['active', 'suspended', 'withdrawn'],
  active: ['withdrawn', 'suspended'],
  suspended: ['active', 'withdrawn'],
  withdrawn: ['draft'], // Can re-draft
  rejected: ['draft'],  // Can re-draft
};

// Safe public projection helper (ensures private seller data, serials, and unapproved listings are protected)
ListingSchema.methods.toPublicListing = function (sellerSummary = null) {
  return {
    id: this._id,
    title: this.title,
    category: this.category,
    brand: this.brand,
    modelName: this.modelName,
    askingPrice: this.askingPrice,
    currency: this.currency,
    generalCondition: this.generalCondition,
    detailedConditionDescription: this.detailedConditionDescription,
    knownDefects: this.knownDefects,
    repairHistory: this.repairHistory,
    includedAccessories: this.includedAccessories,
    purchaseDate: this.purchaseDate,
    usageHistory: this.usageHistory,
    specifications: this.specifications,
    supportedUpgrades: this.supportedUpgrades,
    compatibilityInfo: this.compatibilityInfo,
    images: this.images,
    sellerOwnershipDeclaration: this.sellerOwnershipDeclaration,
    evidenceStatus: this.evidenceStatus,
    status: this.status,
    location: this.location,
    seller: sellerSummary || { id: this.sellerRef },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Listing = model('Listing', ListingSchema);
