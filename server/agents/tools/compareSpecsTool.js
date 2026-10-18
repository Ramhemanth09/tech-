import { Listing } from '../../models/Listing.js';

export async function compareSpecifications(listingIds, requirements = {}) {
  const listings = await Listing.find({ _id: { $in: listingIds }, status: 'active' });

  const targetRam = requirements.ramGb || 16;
  const targetBudget = requirements.budget || Infinity;
  const targetStorage = requirements.storageGb || 512;

  const comparisons = listings.map((l) => {
    const specs = l.specifications || {};
    const ram = specs.ramGb || 0;
    const storage = specs.storageGb || 0;
    const price = l.askingPrice;

    // Requirement 1: Budget
    const budgetStatus = price <= targetBudget ? 'MEETS' : 'DOES_NOT_MEET';

    // Requirement 2: RAM
    let ramStatus = 'UNKNOWN / insufficient evidence';
    if (ram > 0) {
      ramStatus = ram >= targetRam ? 'MEETS' : 'DOES_NOT_MEET';
    }

    // Requirement 3: Storage
    let storageStatus = 'UNKNOWN / insufficient evidence';
    if (storage > 0) {
      storageStatus = storage >= targetStorage ? 'MEETS' : 'DOES_NOT_MEET';
    }

    // Requirement 4: Battery Health
    let batteryStatus = 'UNKNOWN / insufficient evidence';
    let batteryNotes = 'Seller did NOT disclose battery health percentage or cycle count. Note: this is unknown, NOT necessarily poor.';
    if (specs.batteryHealthPercent !== null && specs.batteryHealthPercent !== undefined) {
      batteryStatus = specs.batteryHealthPercent >= 80 ? 'MEETS' : 'DOES_NOT_MEET';
      batteryNotes = `Seller declared ${specs.batteryHealthPercent}% health (evidence status: ${l.evidenceStatus})`;
    }

    // Requirement 5: Upgradeability
    let upgradeStatus = 'UNKNOWN / insufficient evidence';
    if (specs.upgradeableRam !== null || specs.upgradeableStorage !== null) {
      upgradeStatus = (specs.upgradeableRam || specs.upgradeableStorage) ? 'MEETS' : 'DOES_NOT_MEET';
    }

    return {
      listingId: l._id.toString(),
      title: l.title,
      brand: l.brand,
      modelName: l.modelName,
      price: l.askingPrice,
      image: l.images?.[0] || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop',
      images: l.images || [],
      evidenceStatus: l.evidenceStatus,
      requirementsTable: [
        {
          requirement: 'Budget Fit',
          value: `₹${price.toLocaleString()}`,
          status: budgetStatus,
          notes: budgetStatus === 'MEETS' ? `Well within ₹${targetBudget.toLocaleString()}` : 'Exceeds budget',
        },
        {
          requirement: `RAM (Min ${targetRam} GB)`,
          value: ram ? `${ram} GB` : 'Not specified',
          status: ramStatus,
          notes: ram ? `${ram} GB installed` : 'Specification missing from seller declaration',
        },
        {
          requirement: `Storage (Min ${targetStorage} GB)`,
          value: storage ? `${storage} GB ${specs.storageType || ''}` : 'Not specified',
          status: storageStatus,
          notes: specs.storageType ? `${specs.storageType} verified in specs` : 'Storage type not detailed',
        },
        {
          requirement: 'Battery Health Disclosure',
          value: specs.batteryHealthPercent ? `${specs.batteryHealthPercent}%` : 'Not Disclosed',
          status: batteryStatus,
          notes: batteryNotes,
        },
        {
          requirement: 'Hardware Upgradeability',
          value: specs.upgradeableRam ? 'Upgradeable RAM' : 'Fixed RAM',
          status: upgradeStatus,
          notes: (l.supportedUpgrades && l.supportedUpgrades.length > 0) ? l.supportedUpgrades.join(', ') : 'No upgrades listed by seller',
        },
      ],
      advantages: [
        `Asking price: ₹${price.toLocaleString()}`,
        specs.cpu ? `Equipped with ${specs.cpu}` : null,
        l.evidenceStatus === 'verified' ? 'Independently verified proof of purchase/receipt available' : null,
      ].filter(Boolean),
      disadvantages: [
        specs.batteryHealthPercent === null ? 'Undisclosed battery health metric' : null,
        l.knownDefects?.length > 0 ? `Declared defects: ${l.knownDefects.join(', ')}` : null,
      ].filter(Boolean),
    };
  });

  return {
    listingComparisons: comparisons,
    materialDifferences: 'Key trade-offs observed between lowest upfront cost vs transparent battery disclosure & verified evidence documentation.',
  };
}
