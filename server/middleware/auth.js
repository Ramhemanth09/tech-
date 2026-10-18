import { User } from '../models/User.js';
import { errorResponse } from '../utils/responseHelper.js';

export async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      req.session.destroy();
      return errorResponse(res, 'User session invalid. Please log in again.', 401);
    }

    if (user.accountStatus === 'suspended') {
      return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const userId = req.session?.userId;
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.accountStatus !== 'suspended') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
}

export function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401);
  }
  if (!req.user.isEmailVerified) {
    return errorResponse(res, 'Please verify your email address to access this feature.', 403, {
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, `Forbidden: requires one of [${allowedRoles.join(', ')}] role.`, 403);
    }
    next();
  };
}

export function requireModerator(req, res, next) {
  return requireRole('moderator')(req, res, next);
}

// Sanitize body to prevent mass-assignment of role
export function sanitizeUserUpdates(req, res, next) {
  if (req.body) {
    delete req.body.role;
    delete req.body.accountStatus;
    delete req.body.isEmailVerified;
    delete req.body.reputationScore;
  }
  next();
}
