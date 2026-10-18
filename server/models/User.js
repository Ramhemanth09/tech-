import mongoose from 'express';
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'moderator'],
      default: 'buyer',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending_verification'],
      default: 'pending_verification',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    reputationScore: {
      type: Number,
      default: 0,
    },
    successfulSalesCount: {
      type: Number,
      default: 0,
    },
    preferences: {
      currency: { type: String, default: 'INR' },
      categories: [{ type: String }],
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Safe JSON transform: never expose passwordHash
UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    accountStatus: this.accountStatus,
    isEmailVerified: this.isEmailVerified,
    reputationScore: this.reputationScore,
    successfulSalesCount: this.successfulSalesCount,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

export const User = model('User', UserSchema);
