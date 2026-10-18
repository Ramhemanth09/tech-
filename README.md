# Preowned Tech Buying Companion

> A production-grade, multi-role web platform and AI-guided buying companion for preowned **laptops, cameras, and gaming devices**.

---

## 1. Quick Start (Running Locally)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation
Clone or navigate to the project directory:
```bash
cd tech-companion
npm run install:all
```
*(Or install separately: `npm install --prefix server` and `npm install --prefix client`)*

### Seed Demonstration Database
```bash
npm run seed
```
This populates fictional demo devices, technical maintenance manuals for RAG, demo buyers, sellers, and a moderator.

### Start the Application
Run both backend REST API and React frontend concurrently:
```bash
npm run dev
```
- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 2. Demo User Credentials (Quick Logins)
| Role | Email | Password | Purpose |
|---|---|---|---|
| **Buyer** | `buyer@demo.local` | `DemoPass123!` | Shortlists, inquiries, viewings, AI agent |
| **Seller 1** | `seller1@demo.local` | `DemoPass123!` | Owns cheapest ThinkPad (omitted battery health) |
| **Seller 2** | `seller2@demo.local` | `DemoPass123!` | Owns Dell Latitude (verified 84% battery diagnostic) |
| **Moderator** | `moderator@demo.local` | `DemoPass123!` | Reviews queues, inspects private serials & receipts |

*(Note: On the login screen at `http://localhost:5173/login`, click the 1-click **Quick-Fill** buttons for instant testing!)*

---

## 3. Mandatory Demonstration (Reproducing the Evaluation Prompt)
1. Log in as **Buyer** (`buyer@demo.local` / `DemoPass123!`) or open `http://localhost:5173/compare`.
2. Click **"Run Mandatory Demo"** or submit:
   > *"Compare three coding laptops under my budget"* (Budget: ₹48,000)
3. **Observed Results & Evaluation Proof**:
   - **Missing Disclosure Identified**: The cheapest device (*ThinkPad T480*, ₹38,000) is flagged for omitting battery health.
   - **Ethical Grounding**: The system explicitly states battery health is **UNKNOWN, not necessarily poor**.
   - **Trade-Off Analysis**: Compares the cheapest option against the *Dell Latitude 7490* (₹44,500), explaining why paying ₹6,500 more is justified by verified battery diagnostics (84% capacity) and lower replacement risk.
   - **Citations**: Excerpts cited directly from manufacturer hardware maintenance manuals.
   - **Recommended Questions**: Advises the buyer to ask the seller for a battery diagnostic report before purchasing.

---

## 4. Environment Variables & External Configurations

All configurations are read through a validated schema (`server/config/env.js`).

### A. MongoDB Atlas Configuration
By default, if `MONGODB_URI` is left blank, an embedded in-memory MongoDB database starts automatically for instant evaluation.
To connect to real MongoDB Atlas:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Set `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tech_companion?retryWrites=true&w=majority
   ```

#### Atlas Vector Search Index Definition
When using Atlas Vector Search, create an index named `vector_index` on the `documents` and `listings` collections:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

### B. AI Provider Configuration
Supported providers: `gemini` | `openai` | `fallback`.
```env
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
```
*Note: If `AI_API_KEY` is not provided, the system runs safely in **Fallback Mode** (zero hallucinations, keyword search, and deterministic requirement scoring).*

### C. Email Configuration (SMTP)
```env
EMAIL_SERVICE_HOST=smtp.gmail.com
EMAIL_SERVICE_PORT=587
EMAIL_SERVICE_USER=your_email@gmail.com
EMAIL_SERVICE_PASSWORD=your_app_password
```
*In local development without SMTP credentials, verification links and password tokens log directly to the terminal console.*

---

## 5. Running Automated Tests
```bash
npm test
```
Runs Jest test suites testing:
- Authentication, RBAC, single-use tokens, and prevention of moderator self-assignment.
- Listing lifecycle transitions, public projection safety, and serial number masking.
- AI comparison agent execution, citation verification, and prompt injection defenses.
