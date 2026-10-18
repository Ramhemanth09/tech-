import request from 'supertest';
import app from '../server.js';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { PrivateEvidence } from '../models/PrivateEvidence.js';
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

describe('Listings & Private Evidence Security Suite', () => {
  test('Public Search: Only active approved listings are returned; suspended/withdrawn excluded', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Pass123!', salt);
    const seller = await User.create({
      name: 'Seller One',
      email: 's1@test.local',
      passwordHash,
      role: 'seller',
      isEmailVerified: true,
      accountStatus: 'active',
    });

    // Active listing
    await Listing.create({
      sellerRef: seller._id,
      title: 'Active Laptop Device',
      category: 'laptop',
      brand: 'Lenovo',
      modelName: 'T480',
      askingPrice: 35000,
      generalCondition: 'good',
      detailedConditionDescription: 'Clean active unit',
      status: 'active',
    });

    // Suspended listing
    await Listing.create({
      sellerRef: seller._id,
      title: 'Suspended Laptop Device',
      category: 'laptop',
      brand: 'Dell',
      modelName: 'XPS',
      askingPrice: 40000,
      generalCondition: 'good',
      detailedConditionDescription: 'Flagged suspicious',
      status: 'suspended',
    });

    // Draft listing
    await Listing.create({
      sellerRef: seller._id,
      title: 'Draft Laptop Device',
      category: 'laptop',
      brand: 'Apple',
      modelName: 'MacBook',
      askingPrice: 60000,
      generalCondition: 'like_new',
      detailedConditionDescription: 'Draft in progress',
      status: 'draft',
    });

    const res = await request(app).get('/api/listings');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Active Laptop Device');
  });

  test('Privacy: Public listing detail never leaks full serial number or private storedFilePath', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Pass123!', salt);
    const seller = await User.create({
      name: 'Seller Safe',
      email: 'safe@test.local',
      passwordHash,
      role: 'seller',
      isEmailVerified: true,
      accountStatus: 'active',
    });

    const listing = await Listing.create({
      sellerRef: seller._id,
      title: 'Verified Ultrabook',
      category: 'laptop',
      brand: 'Lenovo',
      modelName: 'X1',
      askingPrice: 50000,
      generalCondition: 'excellent',
      detailedConditionDescription: 'Corporate device with receipts',
      status: 'active',
    });

    // Create private evidence with sensitive serial
    await PrivateEvidence.create({
      listingRef: listing._id,
      sellerRef: seller._id,
      documentType: 'purchase_invoice',
      originalFileName: 'original_tax_invoice.pdf',
      storedFilePath: 'uploads/evidence/secret_invoice_path_12345.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 1024,
      fullSerialNumber: 'SECRET-SERIAL-NUM-9999',
      maskedSerialNumber: '••••-••••-9999',
      verificationStatus: 'verified',
    });

    const res = await request(app).get(`/api/listings/${listing._id}`);
    expect(res.status).toBe(200);

    const jsonText = JSON.stringify(res.body);
    expect(jsonText).not.toContain('SECRET-SERIAL-NUM-9999');
    expect(jsonText).not.toContain('secret_invoice_path_12345.pdf');
    expect(jsonText).toContain('••••-••••-9999');
  });

  test('Suspended listing strictly rejects new viewing appointments', async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Pass123!', salt);
    const seller = await User.create({
      name: 'Seller Two',
      email: 's2@test.local',
      passwordHash,
      role: 'seller',
      isEmailVerified: true,
      accountStatus: 'active',
    });
    const buyer = await User.create({
      name: 'Buyer Viewing',
      email: 'bv@test.local',
      passwordHash,
      role: 'buyer',
      isEmailVerified: true,
      accountStatus: 'active',
    });

    const suspendedListing = await Listing.create({
      sellerRef: seller._id,
      title: 'Suspended Console',
      category: 'gaming_device',
      brand: 'Sony',
      modelName: 'PS5',
      askingPrice: 30000,
      generalCondition: 'good',
      detailedConditionDescription: 'Under audit',
      status: 'suspended',
    });

    const agent = request.agent(app);
    await agent
      .post('/api/auth/login')
      .set('x-bypass-csrf-for-testing', 'true')
      .send({ email: 'bv@test.local', password: 'Pass123!' });

    const viewRes = await agent
      .post(`/api/buyer/listings/${suspendedListing._id}/viewings`)
      .set('x-bypass-csrf-for-testing', 'true')
      .send({
        requestedSlot: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(viewRes.status).toBe(400);
  });
});
