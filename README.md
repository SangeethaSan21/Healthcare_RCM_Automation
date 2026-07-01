# MaxtonRCM Automation Framework 🏥💰

Playwright + TypeScript automation framework for **MaxtonRCM** — a Revenue Cycle Management practice app modeled on Maxton Technology's actual product line (Medical Billing, AR Calling, Claims Management).

---

## Project Structure

```
maxton-rcm-automation/
├── pages/                          # Page Object Models
│   ├── BasePage.ts                 # Shared nav, modal, toast, table helpers
│   ├── PatientPage.ts              # Patient registration
│   ├── InsurancePage.ts            # Insurance eligibility verification
│   ├── ClaimsPage.ts               # Claim creation, submit, approve/deny
│   ├── ARCallingPage.ts            # AR follow-up call logging
│   ├── PaymentPage.ts              # ERA/EOB payment posting
│   ├── DenialPage.ts               # Denial management & appeals
│   └── DashboardPage.ts            # Dashboard stats & navigation
├── tests/e2e/
│   ├── patient-registration.spec.ts
│   ├── insurance-verification.spec.ts
│   ├── claims-management.spec.ts
│   ├── ar-calling.spec.ts
│   ├── payment-posting.spec.ts
│   ├── denial-management.spec.ts
│   ├── dashboard.spec.ts
│   └── rcm-e2e-workflow.spec.ts     # Full pipeline E2E tests
├── test-data/
│   └── rcm.data.ts                 # All test data, typed and reusable
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── .github/workflows/playwright.yml
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps

# 3. Configure the app path
cp .env.example .env
# Edit .env — point BASE_URL to wherever you saved maxton-rcm-billing-app.html
```

> **Important:** Save the `maxton-rcm-billing-app.html` dummy app file somewhere on disk first, then update `BASE_URL` in `.env` to its `file://` path. Or host it and point to the URL instead.

---

## Run Tests

```bash
npm test                  # All tests
npm run test:smoke        # Quick sanity check (~10 tests)
npm run test:regression   # Full regression suite
npm run test:e2e          # Full pipeline E2E tests only

# By module
npm run test:patients
npm run test:insurance
npm run test:claims
npm run test:ar
npm run test:payments
npm run test:denials

npm run test:headed       # Watch it run in browser
npm run report            # View HTML report
```

---

## Module Coverage

| Module | Scenarios | Key assertions |
|---|---|---|
| **Patient Registration** | Register, validate, search, toggle status | Patient ID generation, required fields, dashboard sync |
| **Insurance Verification** | Verify/Fail/Pending status, coverage %, co-pay | Status badges, policy number display |
| **Claims Management** | Create, draft, submit, approve, deny, tab filters | CPT/ICD selection, payer auto-fill, status transitions |
| **AR Calling** | Log calls with outcomes & follow-ups | Outcome text, follow-up date persistence |
| **Payment Posting** | Full/partial payment, co-pay, auto-fill | Balance calculation (Charged − Paid), Paid/Partial status |
| **Denial Management** | File appeals (Prior Auth, Medical Necessity, Coding Error) | Status → Appealed, claim sync |
| **Dashboard** | Stat cards, activity table, navigation | Real-time count updates across modules |
| **Full E2E Pipeline** | Happy path + Denial path | Patient → Insurance → Claim → Payment, and Claim → Deny → AR Call → Appeal |

---

## Why this framework matters for interviews

This mirrors the **exact domain** Maxton Technology works in — Revenue Cycle Management, Medical Billing, and AR Calling. Talking points for interviews:

- **POM design** — one Page Object per RCM module, all extending a shared `BasePage`
- **Data-driven testing** — all test data centralized in `rcm.data.ts`, typed with interfaces
- **E2E pipeline tests** — demonstrates understanding of the *full* RCM lifecycle, not just isolated CRUD
- **Status transition testing** — Pending → Submitted → Approved/Denied → Appealed (state machine thinking)
- **Auto-calculation verification** — balance = charged − paid (financial data integrity, critical in billing)
- **Tag-based test execution** — `@smoke`, `@regression`, `@e2e` for CI/CD pipelines

---

## Environment Variables

| Variable | Description |
|---|---|
| `BASE_URL` | Path or URL to the MaxtonRCM dummy app (`file://...` or hosted URL) |
