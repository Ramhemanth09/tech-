# Requirements Traceability Matrix

This document maps every requirement from the project brief directly to the source code file/function implementing it and its automated verification test.

| Requirement Area | Detailed Requirement | Implementing File & Function | Automated Test File |
|---|---|---|---|
| **Role-Based Access** | Buyer registration and verification | `server/controllers/authController.js` (`register`, `verifyEmail`) | `server/tests/auth.test.js` |
| **Role-Based Access** | Users cannot self-assign moderator role | `server/controllers/authController.js` (`registerSchema`) | `server/tests/auth.test.js` |
| **Role-Based Access** | Role mass-assignment protection | `server/middleware/auth.js` (`sanitizeUserUpdates`) | `server/tests/auth.test.js` |
| **Role-Based Access** | Ordinary users blocked from mod routes | `server/middleware/auth.js` (`requireModerator`) | `server/tests/auth.test.js` |
| **Authentication** | Hashed expiring single-use verification tokens | `server/services/auth/tokenService.js` (`createExpiringToken`, `verifyAndConsumeToken`) | `server/tests/auth.test.js` |
| **Authentication** | Password reset with single-use tokens | `server/controllers/authController.js` (`forgotPassword`, `resetPassword`) | `server/tests/auth.test.js` |
| **Security** | Session auth + CSRF validation | `server/middleware/csrf.js` (`csrfProtection`), `server/server.js` | `server/tests/auth.test.js` |
| **Security** | Rate limiting (auth, contact, general) | `server/middleware/rateLimiter.js` (`authLimiter`, `contactLimiter`) | `server/tests/auth.test.js` |
| **Security** | File upload validation & magic bytes | `server/services/evidence/evidenceStorage.js` (`validateMagicBytes`) | `server/tests/listings.test.js` |
| **Security** | Hardware serial number masking | `server/services/evidence/evidenceStorage.js` (`maskSerialNumber`), `server/models/PrivateEvidence.js` | `server/tests/listings.test.js` |
| **Security** | Signed URL / protected evidence access | `server/services/evidence/evidenceStorage.js` (`generateSignedAccessToken`), `server/controllers/listingController.js` | `server/tests/listings.test.js` |
| **Listing Lifecycle** | Allowed transitions state machine | `server/models/Listing.js` (`ALLOWED_TRANSITIONS`), `server/controllers/listingController.js` | `server/tests/listings.test.js` |
| **Listing Visibility** | Only approved active listings in search | `server/controllers/listingController.js` (`getPublicListings`) | `server/tests/listings.test.js` |
| **Viewings** | Suspended listings reject viewing requests | `server/controllers/buyerInteractionController.js` (`requestViewing`) | `server/tests/listings.test.js` |
| **Buyer Interactions** | Idempotent shortlist toggle | `server/controllers/buyerInteractionController.js` (`toggleShortlist`) | `server/tests/listings.test.js` |
| **Buyer Interactions** | Listing Q&A with seller answers | `server/controllers/buyerInteractionController.js` (`askQuestion`, `answerQuestion`) | `server/tests/listings.test.js` |
| **Moderation** | Append-only auditable decision trail | `server/models/ModerationEvent.js`, `server/controllers/moderatorController.js` (`moderateListing`) | `server/tests/auth.test.js` |
| **AI Architecture** | Provider adapter (Gemini, OpenAI, Fallback) | `server/services/ai/aiAdapter.js` (`getAIAdapter`) | `server/tests/aiAgent.test.js` |
| **AI Architecture** | Transparent fallback mode reporting | `server/services/ai/aiAdapter.js` (`FallbackAdapter`), UI badges | `server/tests/aiAgent.test.js` |
| **AI Feature A** | Discovery: exact filters post-retrieval | `server/agents/tools/findListingsTool.js` (`findListings`) | `server/tests/aiAgent.test.js` |
| **AI Feature B** | Spec comparison: MEETS / DOES_NOT_MEET / UNKNOWN | `server/agents/tools/compareSpecsTool.js` (`compareSpecifications`) | `server/tests/aiAgent.test.js` |
| **AI Feature C** | Disclosure inspection: omitted battery detection | `server/agents/tools/inspectDisclosuresTool.js` (`inspectDisclosures`) | `server/tests/aiAgent.test.js` |
| **AI Feature D** | Technical RAG with grounded citations | `server/agents/tools/ragRetrieverTool.js` (`retrieveTechnicalDocuments`, `verifyCitations`) | `server/tests/aiAgent.test.js` |
| **AI Feature E** | AI buyer chat with prompt injection defenses | `server/services/ai/promptDefenses.js`, `server/controllers/aiController.js` (`buyerChat`) | `server/tests/aiAgent.test.js` |
| **AI Feature F** | Multi-tool comparison agent with transparent scoring | `server/agents/workflows/comparisonAgent.js` (`runComparisonWorkflow`) | `server/tests/aiAgent.test.js` |
| **AI Feature G** | Mandatory Demonstration: 3 laptops, cheapest battery omitted, trade-off explanation | `server/seed/seed.js`, `server/agents/workflows/comparisonAgent.js` | `server/tests/aiAgent.test.js` |
| **Frontend** | 29 Complete screens (no placeholders) | `client/src/pages/` (all public, buyer, seller, moderator routes) | Browser automated / manual inspection |
| **Frontend** | 5-Part Comparison Matrix UI | `client/src/components/ai/ComparisonMatrix.jsx` | Browser automated verification |
