import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env.js';

let mongodInstance = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    let uri = config.MONGODB_URI;

    if (!uri) {
      // In dev or test mode, spin up mongodb-memory-server
      console.log('[DB] Initializing embedded MongoDB memory instance...');
      mongodInstance = await MongoMemoryServer.create();
      uri = mongodInstance.getUri();
      console.log(`[DB] Embedded MongoDB running at: ${uri}`);
    }

    await mongoose.connect(uri);
    console.log('[DB] MongoDB connection established successfully.');

    return mongoose.connection;
  } catch (error) {
    console.error('[DB FATAL] Database connection failed:', error.message);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('[DB] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[DB] Error during disconnect:', err.message);
  }
}
