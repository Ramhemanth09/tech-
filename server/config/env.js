import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(16).default('development_secret_only_change_in_production_32_chars'),
  MONGODB_URI: z.string().optional().default(''),
  EMAIL_SERVICE_HOST: z.string().optional().default(''),
  EMAIL_SERVICE_PORT: z.string().optional().default('587'),
  EMAIL_SERVICE_USER: z.string().optional().default(''),
  EMAIL_SERVICE_PASSWORD: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('"Tech Companion" <noreply@techcompanion.local>'),
  AI_PROVIDER: z.enum(['gemini', 'openai', 'fallback']).default('fallback'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('gemini-1.5-flash'),
  EMBEDDING_MODEL: z.string().default('text-embedding-004'),
  EMBEDDING_DIMENSIONS: z.string().default('768').transform((val) => parseInt(val, 10)),
  VECTOR_INDEX_NAME: z.string().default('vector_index'),
  FILE_STORAGE_PROVIDER: z.string().default('local'),
  PRIVATE_FILE_STORAGE_CONFIGURATION: z.string().default('{"uploadDir":"uploads/evidence"}'),
  SIGNED_URL_TTL_SECONDS: z.string().default('3600').transform((val) => parseInt(val, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[CONFIG FATAL] Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;

// Operational Status Warnings (Non-Secret)
export const systemStatus = {
  dbMode: config.MONGODB_URI ? 'Atlas/External' : 'In-Memory Development Database',
  aiMode: config.AI_API_KEY ? config.AI_PROVIDER : 'FALLBACK (Deterministic / Keyword Search)',
  emailMode: (config.EMAIL_SERVICE_USER && config.EMAIL_SERVICE_PASSWORD) ? 'SMTP' : 'Dev Console Logging'
};

export function logStartupStatus() {
  console.log('====================================================');
  console.log('  PREOWNED TECH BUYING COMPANION - STARTUP STATUS');
  console.log('====================================================');
  console.log(`- Environment:     ${config.NODE_ENV}`);
  console.log(`- HTTP Port:       ${config.PORT}`);
  console.log(`- Database Mode:   ${systemStatus.dbMode}`);
  if (!config.MONGODB_URI) {
    console.log('  [!] Notice: MONGODB_URI not provided. Running in-memory MongoDB for local evaluation.');
  }
  console.log(`- AI Engine Mode:  ${systemStatus.aiMode}`);
  if (!config.AI_API_KEY) {
    console.log('  [!] Notice: AI_API_KEY not configured. Running safe Fallback Mode for discovery & comparison.');
  }
  console.log(`- Email Service:   ${systemStatus.emailMode}`);
  if (systemStatus.emailMode === 'Dev Console Logging') {
    console.log('  [!] Notice: Verification links and password tokens will log directly to this console.');
  }
  console.log('====================================================');
}
