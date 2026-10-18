import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findListings } from '../tools/findListingsTool.js';
import { compareSpecifications } from '../tools/compareSpecsTool.js';
import { inspectDisclosures } from '../tools/inspectDisclosuresTool.js';
import { retrieveTechnicalDocuments, verifyCitations } from '../tools/ragRetrieverTool.js';
import { AgentRun } from '../../models/AgentRun.js';
import { getAIAdapter } from '../../services/ai/aiAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load transparent scoring weights
const weightsConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../config/scoringWeights.json'), 'utf8')
);

export async function runComparisonWorkflow({ buyerId, prompt, budget, category = 'laptop', targetListingIds = [] }) {
  const toolExecutions = [];
  const adapter = getAIAdapter();
  const startTime = Date.now();

  let candidateIds = targetListingIds;
  let parsedCriteria = { useCase: prompt, budget: budget || 100000, category };
  let candidateSummaries = [];

  // Step 1 & 2: Tool execution -> findListings (if target IDs not provided)
  const t1Start = Date.now();
  try {
    if (candidateIds.length === 0) {
      const discovery = await findListings(prompt, budget, category);
      parsedCriteria = discovery.criteria;
      candidateSummaries = discovery.candidates;
      candidateIds = discovery.candidates.map((c) => c.id);
      toolExecutions.push({
        toolName: 'findListings',
        arguments: { prompt, budget, category },
        status: discovery.mode === 'fallback' ? 'fallback' : 'success',
        resultSummary: `Found ${candidateIds.length} candidate(s)`,
        executionTimeMs: Date.now() - t1Start,
      });
    } else {
      toolExecutions.push({
        toolName: 'findListings',
        arguments: { targetListingIds },
        status: 'success',
        resultSummary: `Using ${candidateIds.length} preselected listings`,
        executionTimeMs: Date.now() - t1Start,
      });
    }
  } catch (err) {
    toolExecutions.push({
      toolName: 'findListings',
      arguments: { prompt, budget },
      status: 'failed',
      resultSummary: err.message,
      executionTimeMs: Date.now() - t1Start,
    });
  }

  // Step 3: Tool execution -> compareSpecifications
  let specComparison = { listingComparisons: [] };
  const t2Start = Date.now();
  try {
    specComparison = await compareSpecifications(candidateIds, {
      budget: parsedCriteria.budget,
      ramGb: parsedCriteria.minRam || 16,
    });
    toolExecutions.push({
      toolName: 'compareSpecifications',
      arguments: { candidateIds },
      status: 'success',
      resultSummary: `Compared ${specComparison.listingComparisons.length} devices across 5 key criteria`,
      executionTimeMs: Date.now() - t2Start,
    });
  } catch (err) {
    toolExecutions.push({
      toolName: 'compareSpecifications',
      arguments: { candidateIds },
      status: 'failed',
      resultSummary: err.message,
      executionTimeMs: Date.now() - t2Start,
    });
  }

  // Step 4: Tool execution -> inspectDisclosures
  let disclosureInspection = { findings: [] };
  const t3Start = Date.now();
  try {
    disclosureInspection = await inspectDisclosures(candidateIds);
    toolExecutions.push({
      toolName: 'inspectDisclosures',
      arguments: { candidateIds },
      status: 'success',
      resultSummary: `Extracted ${disclosureInspection.findings.length} disclosure and evidence observation(s)`,
      executionTimeMs: Date.now() - t3Start,
    });
  } catch (err) {
    toolExecutions.push({
      toolName: 'inspectDisclosures',
      arguments: { candidateIds },
      status: 'failed',
      resultSummary: err.message,
      executionTimeMs: Date.now() - t3Start,
    });
  }

  // Step 5: Tool execution -> retrieveTechnicalDocuments (RAG)
  let retrievedRAG = { chunks: [] };
  const t4Start = Date.now();
  try {
    retrievedRAG = await retrieveTechnicalDocuments(prompt, { deviceCategory: category });
    toolExecutions.push({
      toolName: 'retrieveTechnicalDocuments',
      arguments: { query: prompt, category },
      status: retrievedRAG.chunks.length > 0 ? 'success' : 'fallback',
      resultSummary: `Retrieved ${retrievedRAG.chunks.length} grounded document passages`,
      executionTimeMs: Date.now() - t4Start,
    });
  } catch (err) {
    toolExecutions.push({
      toolName: 'retrieveTechnicalDocuments',
      arguments: { query: prompt },
      status: 'failed',
      resultSummary: err.message,
      executionTimeMs: Date.now() - t4Start,
    });
  }

  // Verify citations strictly
  const verifiedCitations = verifyCitations(retrievedRAG.chunks, retrievedRAG.chunks);

  // Step 6: Requirement-based deterministic ranking and score breakdown
  const rankings = specComparison.listingComparisons.map((item) => {
    let score = 50; // base score

    // Meets specs checks
    const meetsCount = item.requirementsTable.filter((r) => r.status === 'MEETS').length;
    score += meetsCount * 8;

    // Evidence bonus
    const evBonus = weightsConfig.evidenceBonus[item.evidenceStatus] || 0;
    score += evBonus;

    // Disclosure penalty (e.g. missing battery health)
    const hasBatteryDisclosure = item.requirementsTable.some(
      (r) => r.requirement === 'Battery Health Disclosure' && r.status !== 'UNKNOWN / insufficient evidence'
    );
    if (!hasBatteryDisclosure) {
      score += weightsConfig.disclosurePenalties.missingBatteryHealth; // -8 penalty
    }

    // Clamp 0 to 100
    const finalScore = Math.min(100, Math.max(10, score));

    return {
      listingId: item.listingId,
      title: item.title,
      price: item.price,
      image: item.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop',
      score: finalScore,
      scoreBreakdown: {
        baseScore: 50,
        specRequirementsFit: meetsCount * 8,
        evidenceQualityBonus: evBonus,
        transparencyPenalty: hasBatteryDisclosure ? 0 : weightsConfig.disclosurePenalties.missingBatteryHealth,
        total: finalScore,
      },
      evidenceStatus: item.evidenceStatus,
      batteryDisclosed: hasBatteryDisclosure,
      tradeoffSummary: hasBatteryDisclosure
        ? 'Higher upfront transparency with declared condition/evidence.'
        : 'Lowest initial cost, BUT battery health is UNKNOWN (not necessarily poor). Risk of replacement cost exists.',
    };
  });

  // Sort descending by calculated score
  rankings.sort((a, b) => b.score - a.score);

  // Step 7: Recommended questions & proposed explicit buyer actions
  const allRecommendedQuestions = [
    ...new Set(disclosureInspection.findings.map((f) => f.recommendedQuestion).filter(Boolean)),
  ];

  if (allRecommendedQuestions.length === 0) {
    allRecommendedQuestions.push('Can you confirm if original charger and invoices are provided?');
  }

  // Proposed actions (requiring explicit user confirmation)
  const proposedActions = [
    {
      actionType: 'ask_question',
      description: 'Ask seller about missing battery diagnostic or invoice before finalizing.',
      requiresConfirmation: true,
    },
    {
      actionType: 'request_viewing',
      description: 'Schedule a public inspection viewing to test the device in person.',
      requiresConfirmation: true,
    },
  ];

  const result = {
    mode: adapter.name === 'fallback' ? 'fallback' : 'ai',
    parsedCriteria,
    rankings,
    specificationsComparison: specComparison.listingComparisons,
    disclosureFindings: disclosureInspection.findings,
    tradeoffs: [
      'The cheapest candidate provides the most immediate savings, but omits battery health data. Unknown battery health is not proof of defect, but creates financial uncertainty.',
      'Slightly higher-priced candidates with verified receipts and declared battery metrics offer superior evidence predictability and lower risk of unexpected overhaul expenses.',
    ],
    recommendedQuestions: allRecommendedQuestions,
    proposedActions,
    citations: verifiedCitations,
    totalExecutionTimeMs: Date.now() - startTime,
  };

  // Step 8: Persist run record in AgentRun collection
  try {
    await AgentRun.create({
      buyerRef: buyerId,
      workflowState: 'completed',
      inputSummary: {
        useCase: prompt,
        budget: parsedCriteria.budget,
        currency: 'INR',
        rawPrompt: prompt,
      },
      candidateIds,
      toolExecutions,
      result: {
        rankings,
        tradeoffs: result.tradeoffs,
        missingDisclosures: disclosureInspection.findings,
        recommendedQuestions: allRecommendedQuestions,
        mode: result.mode,
      },
      citations: verifiedCitations,
      errors: [],
    });
  } catch (dbErr) {
    console.error('[AGENT RUN SAVE ERROR]', dbErr.message);
  }

  return {
    success: true,
    data: result,
    toolExecutions,
  };
}
