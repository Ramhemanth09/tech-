# Security and Evaluation Checklist

This document details the application security mechanisms and defensive controls implemented across the Preowned Tech Buying Companion capstone application.

---

## 1. Authentication & Session Integrity
- [x] **Verified-Email Registration**: All buyer and seller registrations generate expiring, SHA-256 hashed, single-use tokens stored in the `Token` collection. Replay attacks and duplicate consumption are blocked.
- [x] **Role Escalation Defense**: `User` registration schema explicitly disallows self-assigning the `moderator` role. Mass assignment on user updates (`req.body.role`, `req.body.accountStatus`) is stripped by `sanitizeUserUpdates` middleware.
- [x] **Password Protection**: Passwords are encrypted using salted bcrypt hashing with safe iteration rounds before persistence.
- [x] **Server-Side Session Management**: Stateful session authentication using `express-session` with `httpOnly`, `sameSite`, and production `secure` flags preventing XSS session theft.
- [x] **Single-Use Password Reset**: Password recovery dispatches short-lived tokens (30 minutes expiry) that are marked `isConsumed = true` immediately upon valid submission.

---

## 2. Authorization & Data Access Controls
- [x] **Strict Role-Based Access Control (RBAC)**: Distinct permissions enforced for `buyer`, `seller`, and `moderator`. Moderator endpoints (`/api/moderator/*`) require verified moderator credentials.
- [x] **Insecure Direct Object Reference (IDOR) Defenses**:
  - Listing modifications verify ownership (`listing.sellerRef == req.user._id`).
  - Viewing status updates check that the requesting user is either the listing buyer or seller.
  - Conversation retrieval verifies authenticated participant membership.
- [x] **Lifecycle Transition Enforcement**: Finite-state machine enforces permitted transitions (`ALLOWED_TRANSITIONS`). Sellers cannot approve or suspend their own listings.
- [x] **Suspended Listing Protections**: Inactive, withdrawn, or suspended listings are excluded from public search queries and strictly reject new viewing appointment requests.

---

## 3. Privacy, Sensitive Data & Evidence Vault
- [x] **Serial Number Masking**: Full hardware serial numbers are masked by default (e.g. `••••-••••-9210`). Full serial numbers are hidden from public queries and LLM context.
- [x] **Private Evidence Protection**: Receipts and invoices are stored in protected directories (`uploads/evidence`). Direct public file serving is blocked; streaming requires an authorized session or a cryptographic HMAC-signed time-limited access token.
- [x] **No Secret Leakage**: Stack traces, database URIs, API keys, and session secrets are kept out of API error responses.

---

## 4. Input Validation & Network Defenses
- [x] **Strict Schema Validation**: All request bodies validated with `Zod` schemas before hitting controllers.
- [x] **CSRF Protection**: Cookie-authenticated state-changing requests (POST, PUT, PATCH, DELETE) require a valid `X-CSRF-Token` header.
- [x] **Rate Limiting**: Granular rate limiters prevent brute-force attacks on auth (`authLimiter`), spamming inquiries (`contactLimiter`), and API denial-of-service (`generalLimiter`).
- [x] **File Upload Security**: Multer file size ceilings (5MB), MIME type verification, extension whitelisting (`.pdf`, `.png`, `.jpg`), and binary magic-bytes inspection (`validateMagicBytes`) preventing executable masquerading.

---

## 5. AI Guardrails & Prompt Injection Defense
- [x] **Delimited Untrusted Data Blocks**: Untrusted user inputs, seller descriptions, and document extracts are wrapped in `<UNTRUSTED_EXTERNAL_DATA>` delimiters with strict system instructions treating them as inert data.
- [x] **Prompt Injection Filtering**: Patterns attempting instruction overrides (`ignore previous instructions`, `system override`, `reveal api key`) are sanitized.
- [x] **No Automated Actions**: The AI comparison agent cannot automatically contact sellers, book viewings, or execute financial transactions. It returns structured proposed actions that require explicit buyer confirmation.
- [x] **Strict Citation Verification**: RAG citations returned by the AI are checked against real retrieved passages; hallucinated chunk IDs are dropped.
- [x] **Ethical AI Boundaries**: AI explicitly does not certify device authenticity, guarantee manufacturer durability, or speculate on remaining lifespan.
- [x] **Missing Disclosure Handling**: Undisclosed specs (such as battery health) are classified as **UNKNOWN / not disclosed**, not assumed to be poor or defective.
