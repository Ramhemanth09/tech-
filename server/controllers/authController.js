import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { createExpiringToken, verifyAndConsumeToken } from '../services/auth/tokenService.js';
import { sendEmail } from '../services/email/emailService.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { config } from '../config/env.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['buyer', 'seller']).default('buyer'), // Explicitly disallows 'moderator'
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req, res, next) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, 'Validation failed', 400, parseResult.error.format());
    }

    const { name, email, password, role } = parseResult.data;

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      isEmailVerified: false,
      accountStatus: 'pending_verification',
    });

    // Create verification token
    const verificationToken = await createExpiringToken(user._id, 'email_verification', 60 * 24);
    const verificationUrl = `${config.CLIENT_ORIGIN}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your Tech Companion Account',
      text: `Hello ${user.name},\n\nPlease verify your email by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
      html: `<p>Hello <strong>${user.name}</strong>,</p><p>Please verify your email address by clicking below:</p><p><a href="${verificationUrl}">Verify Account</a></p><p>Or copy this link: ${verificationUrl}</p>`,
    });

    return successResponse(
      res,
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: user.toPublicJSON(),
        // Expose verification token in dev mode for testing convenience
        ...(config.NODE_ENV !== 'production' ? { devVerificationToken: verificationToken } : {}),
      },
      {},
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) {
      return errorResponse(res, 'Verification token is required', 400);
    }

    const result = await verifyAndConsumeToken(token, 'email_verification');
    if (!result.valid) {
      return errorResponse(res, result.error, 400);
    }

    const user = await User.findById(result.userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isEmailVerified = true;
    user.accountStatus = 'active';
    await user.save();

    return successResponse(res, {
      message: 'Email successfully verified! You may now log in.',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success to avoid user enumeration
      return successResponse(res, { message: 'If an account exists, a new verification link has been sent.' });
    }

    if (user.isEmailVerified) {
      return errorResponse(res, 'Account email is already verified.', 400);
    }

    const token = await createExpiringToken(user._id, 'email_verification', 60 * 24);
    const verificationUrl = `${config.CLIENT_ORIGIN}/verify-email?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your Tech Companion Account',
      text: `Please verify your email by clicking: ${verificationUrl}`,
      html: `<p>Please click here: <a href="${verificationUrl}">Verify Account</a></p>`,
    });

    return successResponse(res, {
      message: 'Verification email resent.',
      ...(config.NODE_ENV !== 'production' ? { devVerificationToken: token } : {}),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return errorResponse(res, 'Invalid email or password format', 400);
    }

    const { email, password } = parseResult.data;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (user.accountStatus === 'suspended') {
      return errorResponse(res, 'Account is suspended.', 403);
    }

    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user._id.toString();
      req.session.userRole = user.role;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');

      res.cookie('XSRF-TOKEN', req.session.csrfToken, {
        httpOnly: false,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return successResponse(res, {
        message: 'Login successful',
        user: user.toPublicJSON(),
        csrfToken: req.session.csrfToken,
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    req.session.destroy((err) => {
      if (err) {
        return errorResponse(res, 'Could not log out, please try again', 500);
      }
      res.clearCookie('connect.sid');
      return successResponse(res, { message: 'Logged out successfully' });
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return successResponse(res, { message: 'If that email exists in our system, password reset instructions have been dispatched.' });
    }

    const resetToken = await createExpiringToken(user._id, 'password_reset', 30); // 30 minutes
    const resetUrl = `${config.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your Tech Companion Password',
      text: `You requested a password reset. Click this link within 30 minutes:\n${resetUrl}`,
      html: `<p>Click below to reset your password within 30 minutes:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
    });

    return successResponse(res, {
      message: 'Password reset link dispatched.',
      ...(config.NODE_ENV !== 'production' ? { devResetToken: resetToken } : {}),
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      return errorResponse(res, 'Valid token and new password (min 8 characters) are required', 400);
    }

    const result = await verifyAndConsumeToken(token, 'password_reset');
    if (!result.valid) {
      return errorResponse(res, result.error, 400);
    }

    const user = await User.findById(result.userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse(res, { message: 'Password has been reset successfully. You may now log in.' });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res) {
  return successResponse(res, { user: req.user.toPublicJSON() });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, preferences } = req.body;

    if (name) req.user.name = name.trim();
    if (preferences) {
      req.user.preferences = {
        ...req.user.preferences,
        ...preferences,
      };
    }

    await req.user.save();
    return successResponse(res, { user: req.user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
}
