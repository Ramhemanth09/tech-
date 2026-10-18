import { Listing } from '../../models/Listing.js';
import { getAIAdapter } from '../../services/ai/aiAdapter.js';
import { wrapUntrustedData } from '../../services/ai/promptDefenses.js';

export async function findListings(needs, budget, category = 'laptop') {
  const adapter = getAIAdapter();
  let criteria = {
    useCase: needs,
    budget: Number(budget) || 100000,
    category: category || 'laptop',
    minRam: 8,
    upgradeableStorage: false,
  };

  // Try extracting structured parameters using AI adapter
  try {
    const parsed = await adapter.generateJSON(
      'Extract search criteria from user prompt.',
      `PARSE_NEEDS: ${needs} budget: ${budget}`,
      'JSON object: { useCase, category, budget, requiredSpecs: { ramGb, upgradeableStorage } }'
    );
    if (parsed?.requiredSpecs?.ramGb) {
      criteria.minRam = parsed.requiredSpecs.ramGb;
    }
    if (parsed?.budget && !budget) {
      criteria.budget = parsed.budget;
    }
  } catch (err) {
    // Continue with extracted criteria safely
  }

  // 1. Candidate retrieval: only active approved listings
  const baseQuery = {
    status: 'active',
    category: criteria.category,
    askingPrice: { $lte: criteria.budget },
  };

  let candidates = await Listing.find(baseQuery).sort({ askingPrice: 1 }).limit(10);

  // If no candidates under budget, explain limitation without silently changing user budget
  if (candidates.length === 0) {
    const nearest = await Listing.findOne({ status: 'active', category: criteria.category }).sort({ askingPrice: 1 });
    return {
      candidates: [],
      criteria,
      explanation: `No active listings found within your strict budget of ₹${criteria.budget.toLocaleString()}. The closest available listing in this category starts at ₹${nearest ? nearest.askingPrice.toLocaleString() : 'N/A'}. Budget has NOT been altered.`,
      mode: adapter.name === 'fallback' ? 'fallback' : 'ai',
    };
  }

  // 2. Exact hard spec filters post-retrieval
  const filteredCandidates = candidates.filter((item) => {
    const ram = item.specifications?.ramGb || 0;
    return ram >= criteria.minRam;
  });

  const finalCandidates = filteredCandidates.length > 0 ? filteredCandidates : candidates;

  return {
    candidates: finalCandidates.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      brand: c.brand,
      modelName: c.modelName,
      price: c.askingPrice,
      ramGb: c.specifications?.ramGb,
      cpu: c.specifications?.cpu || c.specifications?.processor,
      storageGb: c.specifications?.storageGb,
      batteryHealth: c.specifications?.batteryHealthPercent,
      evidenceStatus: c.evidenceStatus,
      condition: c.generalCondition,
    })),
    criteria,
    explanation: `Retrieved ${finalCandidates.length} candidate device(s) matching your criteria under ₹${criteria.budget.toLocaleString()}.`,
    mode: adapter.name === 'fallback' ? 'fallback' : 'ai',
  };
}
