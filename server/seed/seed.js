import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Document } from '../models/Document.js';
import { PrivateEvidence } from '../models/PrivateEvidence.js';
import { Question } from '../models/Question.js';
import { Viewing } from '../models/Viewing.js';
import { ListingReport } from '../models/ListingReport.js';

export async function runSeed() {
  console.log('[SEED] Connecting to database...');
  await connectDB();

  console.log('[SEED] Cleaning existing demo collections...');
  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Document.deleteMany({}),
    PrivateEvidence.deleteMany({}),
    Question.deleteMany({}),
    Viewing.deleteMany({}),
    ListingReport.deleteMany({}),
  ]);

  console.log('[SEED] Seeding users with role-based identities...');
  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('DemoPass123!', salt);

  const buyer = await User.create({
    name: 'Ananya Sharma (Demo Buyer)',
    email: 'buyer@demo.local',
    passwordHash: commonPassword,
    role: 'buyer',
    isEmailVerified: true,
    accountStatus: 'active',
  });

  const seller1 = await User.create({
    name: 'Vikram Electronics (Demo Seller)',
    email: 'seller1@demo.local',
    passwordHash: commonPassword,
    role: 'seller',
    isEmailVerified: true,
    accountStatus: 'active',
    reputationScore: 4.7,
    successfulSalesCount: 14,
  });

  const seller2 = await User.create({
    name: 'Pooja Tech Exchange (Demo Seller)',
    email: 'seller2@demo.local',
    passwordHash: commonPassword,
    role: 'seller',
    isEmailVerified: true,
    accountStatus: 'active',
    reputationScore: 4.9,
    successfulSalesCount: 28,
  });

  const moderator = await User.create({
    name: 'Karthik Nair (Lead Moderator)',
    email: 'moderator@demo.local',
    passwordHash: commonPassword,
    role: 'moderator',
    isEmailVerified: true,
    accountStatus: 'active',
  });

  console.log('[SEED] Seeding technical manuals & spec sheets for RAG...');
  await Document.create([
    {
      title: 'Lenovo ThinkPad T480 Hardware Maintenance Manual [DEMO CORPUS]',
      sourceType: 'manufacturer',
      deviceCategory: 'laptop',
      brand: 'Lenovo',
      modelName: 'ThinkPad T480',
      chunks: [
        {
          chunkId: 'T480-BAT-01',
          sectionOrPage: 'Section 4 - Power Architecture (Page 42)',
          passageText:
            'ThinkPad T480 utilizes PowerBridge dual-battery technology: one internal 24Wh 3-cell battery, plus one hot-swappable external rear battery (available in 24Wh, 48Wh, or 72Wh options). When assessing preowned units, inspect cycle counts on both cells.',
        },
        {
          chunkId: 'T480-RAM-02',
          sectionOrPage: 'Section 6 - Memory Upgrades (Page 68)',
          passageText:
            'The T480 motherboard provides 2x standard 260-pin DDR4 SO-DIMM sockets supporting up to 32GB total (2x16GB DDR4-2400MHz non-ECC). Both slots are end-user upgradeable under the bottom chassis cover.',
        },
      ],
    },
    {
      title: 'Dell Latitude 7490 Owner and Service Manual [DEMO CORPUS]',
      sourceType: 'manufacturer',
      deviceCategory: 'laptop',
      brand: 'Dell',
      modelName: 'Latitude 7490',
      chunks: [
        {
          chunkId: '7490-BAT-01',
          sectionOrPage: 'Battery Diagnostics & Health (Page 29)',
          passageText:
            'Latitude 7490 supports 42Wh or 60Wh ExpressCharge prismatic lithium-ion batteries. Health state can be verified through Dell ePSA Pre-boot diagnostics (accessible via F12 boot menu) or Dell Command Power Manager.',
        },
        {
          chunkId: '7490-RAM-02',
          sectionOrPage: 'System Memory (Page 35)',
          passageText:
            'Equipped with 2x SO-DIMM memory slots. Maximum memory configuration is 32GB (2 x 16GB DDR4 2400MHz). Storage interface supports standard M.2 2280 SATA or PCIe/NVMe Gen3x4 solid-state drives.',
        },
      ],
    },
    {
      title: 'Sony Alpha A6400 Technical Specifications [DEMO CORPUS]',
      sourceType: 'reliable-technical',
      deviceCategory: 'camera',
      brand: 'Sony',
      modelName: 'Alpha A6400',
      chunks: [
        {
          chunkId: 'A6400-SHUTTER-01',
          sectionOrPage: 'Shutter Unit Durability (Page 12)',
          passageText:
            'The electronically controlled focal-plane shutter is tested to approximately 200,000 shutter release cycles. Real-time eye AF for humans and animals is supported up to 11 fps burst shooting.',
        },
      ],
    },
  ]);

  console.log('[SEED] Seeding mandatory demonstration laptops and marketplace listings...');

  // Listing 1: MANDATORY DEMO CHEAPEST LAPTOP (NO BATTERY HEALTH DISCLOSURE)
  const laptopCheap = await Listing.create({
    sellerRef: seller1._id,
    title: 'Lenovo ThinkPad T480 - i5 8th Gen, 16GB RAM, 512GB SSD [DEMO]',
    category: 'laptop',
    brand: 'Lenovo',
    modelName: 'ThinkPad T480',
    askingPrice: 38000,
    currency: 'INR',
    generalCondition: 'good',
    detailedConditionDescription:
      'Sturdy business laptop used for python coding. Trackpoint and keyboard in great shape. Clean body with minor scratches on outer lid. Used primarily connected to wall power on a desk.',
    knownDefects: ['Minor superficial scratches on outer lid', 'Left USB port plastic spacer slightly loose'],
    repairHistory: [{ description: 'Upgraded SSD from 256GB to 512GB NVMe', date: '2023-08', performedBy: 'Self' }],
    includedAccessories: ['Original 65W USB-C Charger', 'Laptop Sleeve'],
    purchaseDate: new Date('2021-04-10'),
    specifications: {
      processor: 'Intel Core i5-8350U Quad Core',
      cpu: 'Intel Core i5-8350U Quad Core',
      ramGb: 16,
      storageGb: 512,
      storageType: 'NVMe SSD',
      screenSize: '14 inch',
      screenResolution: '1920x1080 FHD IPS',
      batteryHealthPercent: null, // CRUCIAL REQUIREMENT: NO BATTERY HEALTH DISCLOSED
      batteryCycleCount: null,
      ports: ['2x USB 3.1', '1x USB-C', '1x Thunderbolt 3', 'HDMI', 'Ethernet RJ45', 'SD Card Reader'],
      upgradeableRam: true,
      upgradeableStorage: true,
    },
    supportedUpgrades: ['RAM expandable to 32GB', 'Replaceable external bridge battery'],
    compatibilityInfo: 'Excellent Linux and Windows 11 compatibility. Supports Docker and VS Code effortlessly.',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop'],
    sellerOwnershipDeclaration: true,
    evidenceStatus: 'none',
    status: 'active',
    location: { city: 'Bangalore', state: 'Karnataka' },
  });

  // Listing 2: MANDATORY DEMO MID-PRICED LAPTOP (WITH VERIFIED BATTERY DIAGNOSTIC)
  const laptopMid = await Listing.create({
    sellerRef: seller2._id,
    title: 'Dell Latitude 7490 - i7 8th Gen, 16GB RAM, 512GB NVMe + Battery Diagnostic [DEMO]',
    category: 'laptop',
    brand: 'Dell',
    modelName: 'Latitude 7490',
    askingPrice: 44500,
    currency: 'INR',
    generalCondition: 'excellent',
    detailedConditionDescription:
      'Corporate lease return machine in pristine working state. Screen is flawless with no dead pixels. Backlit keyboard and fingerprint reader functioning perfectly.',
    knownDefects: [],
    repairHistory: [],
    includedAccessories: ['Original 65W Dell Barrel Charger', 'Dell USB-C Dock Adapter'],
    purchaseDate: new Date('2021-11-15'),
    specifications: {
      processor: 'Intel Core i7-8650U Quad Core',
      cpu: 'Intel Core i7-8650U Quad Core',
      ramGb: 16,
      storageGb: 512,
      storageType: 'NVMe SSD',
      screenSize: '14 inch',
      screenResolution: '1920x1080 FHD Matte IPS',
      batteryHealthPercent: 84, // VERIFIED BATTERY METRIC
      batteryCycleCount: 215,
      ports: ['3x USB 3.1', '1x Thunderbolt 3', 'HDMI', 'uSD Reader'],
      upgradeableRam: true,
      upgradeableStorage: true,
    },
    supportedUpgrades: ['Dual RAM slots support up to 32GB RAM'],
    compatibilityInfo: 'Certified for Ubuntu LTS and Windows 10/11 Pro.',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop'],
    sellerOwnershipDeclaration: true,
    evidenceStatus: 'verified',
    status: 'active',
    location: { city: 'Bangalore', state: 'Karnataka' },
  });

  // Listing 3: HIGHER SPEC CODING LAPTOP
  const laptopHigh = await Listing.create({
    sellerRef: seller2._id,
    title: 'Apple MacBook Pro 13 (2020) - 16GB RAM, 512GB SSD, Retina [DEMO]',
    category: 'laptop',
    brand: 'Apple',
    modelName: 'MacBook Pro 13',
    askingPrice: 58000,
    currency: 'INR',
    generalCondition: 'like_new',
    detailedConditionDescription:
      'Used for iOS app development. Magic keyboard with physical Esc key. Battery condition normal with 88% remaining capacity.',
    knownDefects: [],
    repairHistory: [],
    includedAccessories: ['Original 61W USB-C Apple Adapter', 'Original Box'],
    purchaseDate: new Date('2020-09-01'),
    specifications: {
      processor: 'Intel Core i5 2.0GHz Quad Core 10th Gen',
      cpu: 'Intel Core i5 10th Gen Quad Core',
      ramGb: 16,
      storageGb: 512,
      storageType: 'Apple PCIe SSD',
      screenSize: '13.3 inch',
      screenResolution: '2560x1600 Retina IPS TrueTone',
      batteryHealthPercent: 88,
      batteryCycleCount: 310,
      ports: ['4x Thunderbolt 3 / USB-C', '3.5mm Headphone Jack'],
      upgradeableRam: false,
      upgradeableStorage: false,
    },
    supportedUpgrades: [],
    compatibilityInfo: 'Runs macOS Sonoma, Xcode, Homebrew, and Docker.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop'],
    sellerOwnershipDeclaration: true,
    evidenceStatus: 'verified',
    status: 'active',
    location: { city: 'Bangalore', state: 'Karnataka' },
  });

  // Additional Categories
  const cameraListing = await Listing.create({
    sellerRef: seller1._id,
    title: 'Sony Alpha A6400 Mirrorless Camera + 16-50mm OSS Lens [DEMO]',
    category: 'camera',
    brand: 'Sony',
    modelName: 'Alpha A6400',
    askingPrice: 52000,
    currency: 'INR',
    generalCondition: 'excellent',
    detailedConditionDescription: 'Barely used mirrorless camera. Shutter count around 4,800. 4K HDR recording with unlimited run time.',
    knownDefects: [],
    repairHistory: [],
    includedAccessories: ['16-50mm Kit Lens', '2x Original NP-FW50 Batteries', 'Dual USB Charger', 'Camera Strap'],
    purchaseDate: new Date('2022-03-10'),
    specifications: {
      sensorType: 'APS-C Exmor CMOS',
      resolutionMp: 24.2,
      lensMount: 'Sony E-mount',
      shutterCount: 4800,
      videoRecording4k: true,
    },
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop'],
    sellerOwnershipDeclaration: true,
    evidenceStatus: 'verified',
    status: 'active',
    location: { city: 'Bangalore', state: 'Karnataka' },
  });

  const gamingListing = await Listing.create({
    sellerRef: seller2._id,
    title: 'Sony PlayStation 5 Digital Edition + DualSense Controller [DEMO]',
    category: 'gaming_device',
    brand: 'Sony',
    modelName: 'PlayStation 5 Digital',
    askingPrice: 34000,
    currency: 'INR',
    generalCondition: 'excellent',
    detailedConditionDescription: 'Smoke-free home gaming console. Quiet fan operation. Upgraded to latest PlayStation firmware.',
    knownDefects: [],
    repairHistory: [],
    includedAccessories: ['DualSense Wireless Controller', 'HDMI 2.1 Cable', 'Power Cord', 'Console Stand'],
    purchaseDate: new Date('2022-07-20'),
    specifications: {
      platform: 'PlayStation 5',
      storageGb: 825,
      storageType: 'Custom Ultra-High Speed NVMe SSD',
      controllerIncluded: true,
      firmwareVersion: 'Latest 24.0x',
    },
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop'],
    sellerOwnershipDeclaration: true,
    evidenceStatus: 'verified',
    status: 'active',
    location: { city: 'Bangalore', state: 'Karnataka' },
  });

  // Seed sample private evidence for verified listings
  await PrivateEvidence.create({
    listingRef: laptopMid._id,
    sellerRef: seller2._id,
    documentType: 'battery_diagnostic_report',
    originalFileName: 'Dell_BIOS_ePSA_BatteryHealth_Check.pdf',
    storedFilePath: 'uploads/evidence/demo_dell_epsa.pdf',
    mimeType: 'application/pdf',
    fileSizeBytes: 245120,
    fullSerialNumber: 'DELL-LT-7490-8839210',
    maskedSerialNumber: '••••-••••-9210',
    verificationStatus: 'verified',
    moderatorNotes: 'Verified BIOS diagnostic output and battery serial match.',
    verifiedBy: moderator._id,
  });

  // Seed sample question & viewing
  await Question.create({
    listingRef: laptopCheap._id,
    buyerRef: buyer._id,
    sellerRef: seller1._id,
    questionText: 'Is the RAM 1x16GB or 2x8GB in this ThinkPad?',
    answerText: 'It has 1x16GB installed in slot 1, leaving the second SO-DIMM slot free for a 32GB total upgrade!',
    answeredAt: new Date(),
    isPublic: true,
  });

  await Viewing.create({
    listingRef: laptopMid._id,
    buyerRef: buyer._id,
    sellerRef: seller2._id,
    requestedSlot: new Date(Date.now() + 48 * 60 * 60 * 1000), // In 2 days
    locationPreference: 'Starbucks Coffee, Koramangala 5th Block, Bangalore',
    notes: 'Would like to run terminal diagnostic and test display uniformity.',
    status: 'confirmed',
  });

  // Seed a submitted listing for Moderator Queue
  const pendingListing = await Listing.create({
    sellerRef: seller1._id,
    title: 'Canon EOS M50 Mark II Mirrorless [Awaiting Review]',
    category: 'camera',
    brand: 'Canon',
    modelName: 'EOS M50 Mark II',
    askingPrice: 39000,
    currency: 'INR',
    generalCondition: 'excellent',
    detailedConditionDescription: 'Lightly used for travel vlog. Ready for review.',
    specifications: { resolutionMp: 24.1, lensMount: 'EF-M' },
    status: 'submitted', // Under review
    images: ['https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop'],
    location: { city: 'Bangalore', state: 'Karnataka' },
  });

  // Seed a reported listing for Moderator Report Queue
  const reportedListing = await Listing.create({
    sellerRef: seller1._id,
    title: 'Nintendo Switch OLED Neon [Suspicious Report Demonstration]',
    category: 'gaming_device',
    brand: 'Nintendo',
    modelName: 'Switch OLED',
    askingPrice: 12000, // Improbably cheap price triggering report
    currency: 'INR',
    generalCondition: 'like_new',
    detailedConditionDescription: 'Selling fast.',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop'],
  });

  await ListingReport.create({
    reporterRef: buyer._id,
    listingRef: reportedListing._id,
    reason: 'suspicious_pricing_or_scam',
    details: 'Price of ₹12,000 is ~60% below market value and seller is declining physical inspection.',
    status: 'pending',
  });

  console.log('[SEED] Demonstration seed finished successfully.');
  console.log('----------------------------------------------------');
  console.log('Credentials Summary:');
  console.log('- Buyer:     buyer@demo.local       / DemoPass123!');
  console.log('- Seller 1:  seller1@demo.local     / DemoPass123!');
  console.log('- Seller 2:  seller2@demo.local     / DemoPass123!');
  console.log('- Moderator: moderator@demo.local   / DemoPass123!');
  console.log('----------------------------------------------------');
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED ERROR]', err);
      process.exit(1);
    });
}
