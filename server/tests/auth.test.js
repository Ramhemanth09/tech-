import request from 'supertest';
import app from '../server.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import { User } from '../models/User.js';
import { Token } from '../models/Token.js';
import bcrypt from 'bcryptjs';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Authentication & RBAC Security Suite', () => {
  test('User Registration: Prevents self-assigning moderator role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('x-bypass-csrf-for-testing', 'true')
      .send({
        name: 'Attacker User',
        email: 'attacker@test.local',
        password: 'Password123!',
        role: 'moderator', // Attempt role escalation
      });

    // Zod schema rejects 'moderator' in registration
    expect(res.status).toBe(400);
    const user = await User.findOne({ email: 'attacker@test.local' });
    expect(user).toBeNull();
  });

  test('Registration & Single-Use Email Verification Flow', async () => {
    // 1. Register valid buyer
    const regRes = await request(app)
      .post('/api/auth/register')
      .set('x-bypass-csrf-for-testing', 'true')
      .send({
        name: 'Regular Buyer',
        email: 'buyer@test.local',
        password: 'BuyerPass123!',
        role: 'buyer',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.devVerificationToken).toBeDefined();

    const token = regRes.body.data.devVerificationToken;

    // 2. Consume token to verify
    const verifyRes = await request(app).get(`/api/auth/verify-email?token=${token}`);
    expect(verifyRes.status).toBe(200);

    const verifiedUser = await User.findOne({ email: 'buyer@test.local' });
    expect(verifiedUser.isEmailVerified).toBe(true);
    expect(verifiedUser.accountStatus).toBe('active');

    // 3. Single-use check: reusing same token must fail
    const reuseRes = await request(app).get(`/api/auth/verify-email?token=${token}`);
    expect(reuseRes.status).toBe(400);
  });

  test('Password Recovery: Single-Use Expiring Reset Token', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('OldPass123!', salt);
    const user = await User.create({
      name: 'Reset Test',
      email: 'reset@test.local',
      passwordHash,
      role: 'buyer',
      isEmailVerified: true,
      accountStatus: 'active',
    });

    // Request reset
    const reqRes = await request(app)
      .post('/api/auth/forgot-password')
      .set('x-bypass-csrf-for-testing', 'true')
      .send({ email: 'reset@test.local' });

    expect(reqRes.status).toBe(200);
    const resetToken = reqRes.body.data.devResetToken;
    expect(resetToken).toBeDefined();

    // Consume reset token
    const submitRes = await request(app)
      .post('/api/auth/reset-password')
      .set('x-bypass-csrf-for-testing', 'true')
      .send({
        token: resetToken,
        newPassword: 'NewSecurePassword123!',
      });

    expect(submitRes.status).toBe(200);

    // Reuse token must fail
    const secondSubmitRes = await request(app)
      .post('/api/auth/reset-password')
      .set('x-bypass-csrf-for-testing', 'true')
      .send({
        token: resetToken,
        newPassword: 'AnotherPassword123!',
      });

    expect(secondSubmitRes.status).toBe(400);
  });

  test('RBAC: Non-moderator cannot access moderator queues or decision routes', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('BuyerPass123!', salt);
    await User.create({
      name: 'Ordinary Buyer',
      email: 'ordinary@test.local',
      passwordHash,
      role: 'buyer',
      isEmailVerified: true,
      accountStatus: 'active',
    });

    const agent = request.agent(app);

    // Login as buyer
    await agent
      .post('/api/auth/login')
      .set('x-bypass-csrf-for-testing', 'true')
      .send({ email: 'ordinary@test.local', password: 'BuyerPass123!' });

    // Try accessing moderator queue
    const queueRes = await agent.get('/api/moderator/queue/submitted');
    expect(queueRes.status).toBe(403);
  });
});
