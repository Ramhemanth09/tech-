import { Listing } from '../../models/Listing.js';
import { PrivateEvidence } from '../../models/PrivateEvidence.js';

export async function inspectDisclosures(listingIds) {
  const listings = await Listing.find({ _id: { $in: listingIds } });
  const findings = [];

  for (const listing of listings) {
    const listingId = listing._id.toString();
    const specs = listing.specifications || {};
    const evidenceCount = await PrivateEvidence.countDocuments({ listingRef: listing._id });

    // 1. Mandatory Demo Requirement: Battery Health Disclosure Check
    if (listing.category === 'laptop') {
      if (specs.batteryHealthPercent === null || specs.batteryHealthPercent === undefined) {
        findings.push({
          listingId,
          device: `${listing.brand} ${listing.modelName}`,
          source: 'Seller Specifications Declaration',
          severity: 'HIGH_UNCERTAINTY',
          field: 'batteryHealthPercent',
          finding: 'Battery health percentage and cycle count were NOT disclosed by seller.',
          significance:
            'Battery health is UNKNOWN, not necessarily poor. However, replacing a degraded battery can cost ₹3,500 - ₹8,000 depending on model. Further inquiry with the seller is strongly advised prior to committing.',
          recommendedQuestion:
            'Could you run a native battery diagnostic or terminal command (e.g. powercfg /batteryreport or coconutBattery) and share the maximum remaining capacity?',
        });
      }
    }

    // 2. Evidence verification audit
    if (listing.evidenceStatus === 'none' || evidenceCount === 0) {
      findings.push({
        listingId,
        device: `${listing.brand} ${listing.modelName}`,
        source: 'Evidence Repository',
        severity: 'EVIDENCE_GAP',
        field: 'evidenceRecords',
        finding: 'No supporting documentation (invoice, receipt, or diagnostic) submitted.',
        significance:
          'Seller claims regarding condition, original purchase year, and repairs remain unverified declarations. This is an information gap, not proof of fraud.',
        recommendedQuestion:
          'Do you have the original store invoice or proof of purchase for this device?',
      });
    }

    // 3. Known defects & repairs transparency
    if (listing.knownDefects && listing.knownDefects.length > 0) {
      findings.push({
        listingId,
        device: `${listing.brand} ${listing.modelName}`,
        source: 'Seller Disclosures',
        severity: 'DISCLOSED_DEFECT',
        field: 'knownDefects',
        finding: `Seller transparently disclosed known defects: ${listing.knownDefects.join(', ')}`,
        significance: 'Positive seller transparency score. Factor repair/workaround cost into total cost of ownership.',
        recommendedQuestion: 'Have these defects caused any functional issues during prolonged usage?',
      });
    }

    // 4. Missing upgradeability notes
    if (specs.upgradeableRam === null && specs.upgradeableStorage === null) {
      findings.push({
        listingId,
        device: `${listing.brand} ${listing.modelName}`,
        source: 'Technical Specifications',
        severity: 'SPEC_GAP',
        field: 'upgradeability',
        finding: 'RAM and storage upgrade options are not explicitly declared.',
        significance: 'Limits understanding of whether device can be expanded as software demands grow.',
        recommendedQuestion: 'Is the internal memory soldered or are SO-DIMM slots accessible?',
      });
    }
  }

  return {
    findings,
    summary: `${findings.length} disclosure and evidence observation(s) noted across ${listings.length} candidate(s).`,
  };
}
