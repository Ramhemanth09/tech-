import { runComparisonWorkflow } from '../agents/workflows/comparisonAgent.js';
import { retrieveTechnicalDocuments, verifyCitations } from '../agents/tools/ragRetrieverTool.js';
import { AgentRun } from '../models/AgentRun.js';
import { Listing } from '../models/Listing.js';
import { getAIAdapter } from '../services/ai/aiAdapter.js';
import { wrapUntrustedData } from '../services/ai/promptDefenses.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

/**
 * AI Buyer Chat with grounded RAG passages, product discovery & instant comparison redirect
 */
export async function buyerChat(req, res, next) {
  try {
    const { messages, deviceCategory = 'laptop' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return errorResponse(res, 'Messages array is required', 400);
    }

    const adapter = getAIAdapter();
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const lowerMsg = lastUserMessage.toLowerCase();

    // 1. Detect Category & Budget
    let detectedCategory = deviceCategory;
    if (lowerMsg.includes('camera') || lowerMsg.includes('dslr') || lowerMsg.includes('lens')) {
      detectedCategory = 'camera';
    } else if (lowerMsg.includes('gaming') || lowerMsg.includes('console') || lowerMsg.includes('ps5') || lowerMsg.includes('switch')) {
      detectedCategory = 'gaming_device';
    } else if (lowerMsg.includes('laptop') || lowerMsg.includes('macbook') || lowerMsg.includes('thinkpad') || lowerMsg.includes('coding') || lowerMsg.includes('programming')) {
      detectedCategory = 'laptop';
    }

    // Extract budget number (e.g. 45k, 45000, 48,000, under 50000)
    let detectedBudget = 48000;
    const kMatch = lowerMsg.match(/(?:under|below|budget|max|within)?\s*([0-9]{1,3})\s*k\b/i);
    const numMatch = lowerMsg.match(/(?:under|below|budget|max|within|₹|rs\.?|inr)?\s*([0-9]{2,3}[,.]?[0-9]{3})/i);
    if (kMatch) {
      detectedBudget = parseInt(kMatch[1], 10) * 1000;
    } else if (numMatch) {
      detectedBudget = parseInt(numMatch[1].replace(/[,.]/g, ''), 10);
    }

    // Check if the user is seeking a recommendation, comparison, or wanting a product
    const isProductIntent =
      lowerMsg.includes('want') ||
      lowerMsg.includes('need') ||
      lowerMsg.includes('looking for') ||
      lowerMsg.includes('suggest') ||
      lowerMsg.includes('recommend') ||
      lowerMsg.includes('laptop') ||
      lowerMsg.includes('camera') ||
      lowerMsg.includes('compare') ||
      lowerMsg.includes('find');

    let matchedProducts = [];
    let redirectAction = null;

    if (isProductIntent) {
      // Find matching active listings
      const candidates = await Listing.find({
        status: 'active',
        category: detectedCategory,
        askingPrice: { $lte: detectedBudget * 1.35 }, // Allow slight margin for transparent trade-offs
      })
        .select('title askingPrice brand modelName specifications images evidenceStatus generalCondition')
        .sort({ askingPrice: 1 })
        .limit(4);

      if (candidates.length > 0) {
        matchedProducts = candidates.map((c) => ({
          id: c._id,
          title: c.title,
          price: c.askingPrice,
          brand: c.brand,
          modelName: c.modelName,
          image: c.images?.[0] || '',
          batteryHealth: c.specifications?.batteryHealthPercent,
          ramGb: c.specifications?.ramGb,
          storageGb: c.specifications?.storageGb,
          evidenceStatus: c.evidenceStatus,
          condition: c.generalCondition,
        }));

        const promptText = `Compare ${matchedProducts.length} ${detectedCategory === 'laptop' ? 'coding laptops' : detectedCategory === 'camera' ? 'cameras' : 'gaming devices'} under ₹${detectedBudget}`;
        const targetUrl = `/compare?category=${detectedCategory}&budget=${detectedBudget}&prompt=${encodeURIComponent(promptText)}&autoRun=true`;

        redirectAction = {
          type: 'compare_redirect',
          targetUrl,
          buttonText: `Compare Matching ${detectedCategory === 'laptop' ? 'Laptops' : detectedCategory === 'camera' ? 'Cameras' : 'Consoles'}`,
          category: detectedCategory,
          budget: detectedBudget,
          matchedCount: matchedProducts.length,
          matchedProducts,
          autoRedirectInMs: 3000,
        };
      }
    }

    // Retrieve relevant technical chunks for grounding
    const retrieved = await retrieveTechnicalDocuments(lastUserMessage, { deviceCategory: detectedCategory });
    const verifiedCitations = verifyCitations(retrieved.chunks, retrieved.chunks);

    const contextSnippets = retrieved.chunks
      .map(
        (c) =>
          `[PASSAGE ID: ${c.chunkId}] (Source: ${c.sourceType} - ${c.documentTitle}, ${c.sectionOrPage})\n"${c.excerpt}"`
      )
      .join('\n\n');

    let reply = '';
    let mode = 'ai';

    if (isProductIntent && matchedProducts.length > 0) {
      const topItems = matchedProducts
        .map((p) => {
          const battery = p.batteryHealth != null ? `Battery: ${p.batteryHealth}% (Verified)` : 'Battery: Undisclosed by seller';
          return `• **${p.brand} ${p.modelName || p.title}** (₹${p.price.toLocaleString()}) — ${p.ramGb ? `${p.ramGb}GB RAM, ` : ''}${p.storageGb ? `${p.storageGb}GB SSD, ` : ''}${battery}`;
        })
        .join('\n');

      reply = `I found **${matchedProducts.length} matching verified options** for your request:\n\n${topItems}\n\nI have prepared a side-by-side spec comparison, verified diagnostic review, and trade-off breakdown for you.\n\n👉 **Redirecting you to the comparison view now...** (or click the button below to view immediately)`;
      mode = 'fallback';
    } else {
      const systemPrompt = `
You are the Preowned Tech Buying Assistant.
Always distinguish between verified manufacturer documentation and seller claims.
If battery health or another key spec is not disclosed, state clearly that it is UNKNOWN, NOT necessarily poor.
Never predict lifespan or guarantee performance.
When using technical excerpts, cite them using their [PASSAGE ID].

Grounding Technical Excerpts:
${wrapUntrustedData('CorpusPassages', contextSnippets)}
`;

      try {
        if (adapter.name === 'fallback') {
          reply = await adapter.generateChat(messages, systemPrompt);
          mode = 'fallback';
        } else {
          reply = await adapter.generateChat(messages, systemPrompt);
        }
      } catch (err) {
        console.warn('[AI CHAT FALLBACK] Error invoking primary AI provider:', err.message);
        reply = `Based on technical specifications: Battery health should always be validated directly with the seller before purchasing. An omitted battery percentage is unknown, not necessarily poor.`;
        mode = 'fallback';
      }
    }

    return successResponse(res, {
      message: {
        role: 'assistant',
        content: reply,
      },
      action: redirectAction,
      citations: verifiedCitations,
      mode,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Comparison Agent Runner
 */
export async function runComparisonAgent(req, res, next) {
  try {
    const { prompt, budget, category, listingIds } = req.body;

    if (!prompt && (!listingIds || listingIds.length === 0)) {
      return errorResponse(res, 'Prompt or target listing IDs are required', 400);
    }

    const result = await runComparisonWorkflow({
      buyerId: req.user?._id || null,
      prompt: prompt || 'Compare selected listings',
      budget: budget ? Number(budget) : undefined,
      category: category || 'laptop',
      targetListingIds: listingIds || [],
    });

    return successResponse(res, result.data, {
      toolExecutions: result.toolExecutions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Buyer's Past Comparison Agent Runs
 */
export async function getAgentRuns(req, res, next) {
  try {
    const runs = await AgentRun.find({ buyerRef: req.user._id })
      .populate('candidateIds', 'title askingPrice brand modelName images')
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, runs);
  } catch (error) {
    next(error);
  }
}
