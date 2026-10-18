import { runSeed } from '../server/seed/seed.js';
import { disconnectDB } from '../server/config/db.js';

runSeed()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch((err) => {
    console.error('[SEED ERROR]', err);
    process.exit(1);
  });
