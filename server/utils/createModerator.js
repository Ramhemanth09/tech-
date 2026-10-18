import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';

async function createModerator() {
  await connectDB();

  const email = process.argv[2] || 'moderator@techcompanion.local';
  const password = process.argv[3] || 'ModSecret123!';
  const name = process.argv[4] || 'Lead Moderator (Demo)';

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'moderator';
    existing.isEmailVerified = true;
    existing.accountStatus = 'active';
    await existing.save();
    console.log(`[CLI] Existing user ${email} successfully promoted to moderator.`);
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await User.create({
      name,
      email,
      passwordHash,
      role: 'moderator',
      isEmailVerified: true,
      accountStatus: 'active',
    });
    console.log(`[CLI] Created new moderator account: ${email} (Password: ${password})`);
  }

  await disconnectDB();
  process.exit(0);
}

createModerator().catch((err) => {
  console.error('[CLI ERROR]', err);
  process.exit(1);
});
