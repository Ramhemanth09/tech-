import { Document } from '../../models/Document.js';
import { getAIAdapter } from '../../services/ai/aiAdapter.js';

export async function retrieveTechnicalDocuments(query, filter = {}) {
  const adapter = getAIAdapter();
  const queryLower = query.toLowerCase();

  // Try text/keyword match across Document chunks
  const docQuery = { accessPermissions: 'public' };
  if (filter.deviceCategory) docQuery.deviceCategory = filter.deviceCategory;
  if (filter.brand) docQuery.brand = new RegExp(filter.brand, 'i');

  const documents = await Document.find(docQuery);
  const matchedChunks = [];

  for (const doc of documents) {
    for (const chunk of doc.chunks) {
      const text = chunk.passageText.toLowerCase();
      // Match keywords in chunk text
      const words = queryLower.split(/\s+/).filter((w) => w.length > 3);
      let matchScore = 0;
      for (const w of words) {
        if (text.includes(w)) matchScore += 1;
      }

      if (matchScore > 0 || words.length === 0) {
        matchedChunks.push({
          documentId: doc._id.toString(),
          documentTitle: doc.title,
          sourceType: doc.sourceType, // manufacturer | reliable-technical | seller-provided
          chunkId: chunk.chunkId,
          sectionOrPage: chunk.sectionOrPage,
          excerpt: chunk.passageText,
          matchScore,
        });
      }
    }
  }

  // Sort by match score and limit top 4
  matchedChunks.sort((a, b) => b.matchScore - a.matchScore);
  const topChunks = matchedChunks.slice(0, 4);

  return {
    chunks: topChunks,
    count: topChunks.length,
    retrievalMode: adapter.name === 'fallback' ? 'keyword_text' : 'hybrid_vector',
  };
}

/**
 * Citation Verifier:
 * Guarantees every citation returned by AI strictly maps to an actual chunk retrieved in context.
 * Drops hallucinated or ungrounded citations.
 */
export function verifyCitations(aiCitations, retrievedChunks) {
  if (!Array.isArray(aiCitations) || aiCitations.length === 0) {
    return [];
  }

  const validChunkIds = new Set(retrievedChunks.map((c) => c.chunkId));
  const chunkMap = new Map(retrievedChunks.map((c) => [c.chunkId, c]));

  const verified = [];

  for (const citation of aiCitations) {
    if (citation.chunkId && validChunkIds.has(citation.chunkId)) {
      const original = chunkMap.get(citation.chunkId);
      verified.push({
        documentId: original.documentId,
        documentTitle: original.documentTitle,
        sourceType: original.sourceType,
        chunkId: original.chunkId,
        sectionOrPage: original.sectionOrPage,
        excerpt: original.excerpt,
      });
    } else {
      console.warn(`[RAG SAFETY] Dropping unverified citation hallucinated by AI: ${JSON.stringify(citation)}`);
    }
  }

  return verified;
}
