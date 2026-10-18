import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { config, logStartupStatus } from './config/env.js';
import { connectDB } from './config/db.js';
import { csrfTokenProvider } from './middleware/csrf.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/responseHelper.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import moderatorRoutes from './routes/moderatorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Let React frontend render cleanly in local development
    crossOriginEmbedderPolicy: false,
  })
);

// Restrictive CORS
app.use(
  cors({
    origin: config.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token', 'x-bypass-csrf-for-testing'],
  })
);

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Server-side Session Management
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'tech_companion_sid',
    cookie: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// CSRF Token Generation
app.use(csrfTokenProvider);

// Rate limiting on all API routes
app.use('/api', generalLimiter);

// CSRF retrieval endpoint
app.get('/api/csrf-token', (req, res) => {
  return successResponse(res, { csrfToken: req.session.csrfToken });
});

// System Status endpoint
app.get('/api/status', (req, res) => {
  return successResponse(res, {
    environment: config.NODE_ENV,
    aiProvider: config.AI_PROVIDER,
    hasAiKey: Boolean(config.AI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/moderator', moderatorRoutes);
app.use('/api', aiRoutes); // /api/buyer-chat, /api/comparison-agent

// 404 & Central Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Start server function
export async function startServer() {
  logStartupStatus();
  await connectDB();

  // In development, auto-seed if database is empty
  if (config.NODE_ENV === 'development') {
    const { Listing } = await import('./models/Listing.js');
    const count = await Listing.countDocuments();
    if (count === 0) {
      console.log('[AUTO-SEED] Database empty in development mode. Seeding demo dataset automatically...');
      const { runSeed } = await import('./seed/seed.js');
      await runSeed();
    }
  }

  return new Promise((resolve) => {
    const server = app.listen(config.PORT, () => {
      console.log(`[HTTP] Server listening on port ${config.PORT} (PID: ${process.pid})`);
      console.log(`[HTTP] API root available at: http://localhost:${config.PORT}/api`);
      resolve(server);
    });
  });
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer().catch((err) => {
    console.error('[FATAL SERVER ERROR]', err);
    process.exit(1);
  });
}

export default app;
