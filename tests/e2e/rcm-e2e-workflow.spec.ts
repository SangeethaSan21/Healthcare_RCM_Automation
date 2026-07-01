import { test, expect } from '@playwright/test';
import { PatientPage } from '../../pages/PatientPage';
import { InsurancePage } from '../../pages/InsurancePage';
import { ClaimsPage } from '../../pages/ClaimsPage';
import { ARCallingPage } from '../../pages/ARCallingPage';
import { PaymentPage } from '../../pages/PaymentPage';
import { DenialPage } from '../../pages/DenialPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { patientData, verificationData, claimData, arCallData, paymentData, appealData } from '../../test-data/rcm.data';

/**
 * Full RCM Pipeline E2E Tests
 * These tests simulate the complete revenue cycle workflow:
 * Patient Registration → Insurance Verification → Claim Submission
 * → AR Follow-up → Payment Posting / Denial & Appeal
 *
 * This is exactly what Maxton Technology's RCM product does.
 */

test.describe('Full RCM Pipeline — End to End', () => {

  test('@e2e Happy path: Patient registers → Insurance verified → Claim submitted → Payment posted', async ({ page }) => {
    const BASE = process.env.BASE_URL || 'https://Sangeethasan21.github.io/healthcare_rcm_automation/';

    // ── STEP 1: Register Patient ────────────────────────────────────────────
    const patPage = new PatientPage(page);
    await page.goto(BASE);
    await patPage.goToPatients();
    const patientId = await patPage.registerPatient(patientData.validPatient);
    expect(patientId).toMatch(/PAT-\d+/);
    await patPage.verifyPatientExists(patientId);
    await patPage.verifyPatientStatus(patientId, 'Active');

    // ── STEP 2: Verify Insurance ────────────────────────────────────────────
    const insPage = new InsurancePage(page);
    await insPage.goToInsurance();
    await insPage.verifyInsurance({
      ...verificationData.verifiedInsurance,
      patientId: 'PAT-001', // use existing seeded patient for autofill
    });
    await insPage.verifyInsuranceStatus('PAT-001', 'Verified');

    // ── STEP 3: Create & Submit Claim ───────────────────────────────────────
    const claimsPage = new ClaimsPage(page);
    await claimsPage.goToClaims();
    const claimId = await claimsPage.createAndSubmitClaim(claimData.officeVisitClaim);
    expect(claimId).toMatch(/CLM-\d{4}-\d+/);
    await claimsPage.verifyClaimStatus(claimId, 'Submitted');

    // ── STEP 4: Approve Claim ───────────────────────────────────────────────
    await claimsPage.approveClaim(claimId);
    await claimsPage.verifyClaimStatus(claimId, 'Approved');

    // ── STEP 5: Post Payment ────────────────────────────────────────────────
    const payPage = new PaymentPage(page);
    await payPage.goToPayments();
    await payPage.postPayment({
    claimId,
    paidAmount: 3500,
    paymentType: 'Insurance Payment',
    paymentDate: '2024-11-30',
    referenceNumber: 'EFT-E2E-001',
  });
    await payPage.verifyPaymentPosted(claimId);
    // Use last() — earlier tests may have posted partial payments against same claim
    const row = page.locator(`#payment-tbody tr:has-text("${claimId}")`).last();
    const status = await row.locator('[data-testid="status-badge"]').innerText();
    expect(status).toBe('Paid');
  });

  test('@e2e Denial path: Claim submitted → Denied → AR Call → Appeal filed', async ({ page }) => {
    const BASE = process.env.BASE_URL || 'https://YOUR-USERNAME.github.io/maxton-rcm-automation/';

    // ── STEP 1: Submit a claim ──────────────────────────────────────────────
    const claimsPage = new ClaimsPage(page);
    await page.goto(BASE);
    await claimsPage.goToClaims();
    const claimId = await claimsPage.createAndSubmitClaim(claimData.surgicalClaim);
    await claimsPage.verifyClaimStatus(claimId, 'Submitted');

    // ── STEP 2: Deny the claim ──────────────────────────────────────────────
    await claimsPage.denyClaim(claimId);
    await claimsPage.verifyClaimStatus(claimId, 'Denied');

    // ── STEP 3: Log an AR call for the denied claim ─────────────────────────
    const arPage = new ARCallingPage(page);
    await arPage.goToAR();
    await arPage.logCall({
      claimId,
      payer: 'HDFC ERGO',
      callDate: '2024-11-22',
      agentName: 'Kavya S.',
      outcome: 'Claim denied',
      followUpDate: '2024-11-29',
      notes: `Claim ${claimId} denied — prior auth missing. Will file appeal.`,
    });
    await arPage.verifyCallLogged(claimId);

    // ── STEP 4: File an appeal ──────────────────────────────────────────────
    const denialPage = new DenialPage(page);
    await denialPage.goToDenials();
    await denialPage.verifyDenialExists(claimId);
    await denialPage.verifyDenialStatus(claimId, 'Pending');
    await denialPage.fileAppeal({
      claimId,
      appealType: 'Prior Auth Missing',
      appealDate: '2024-11-25',
      justification: 'PA was obtained prior to surgery. Attaching PA approval letter.',
      supportingDocs: 'Prior Auth Letter',
    });
    await denialPage.verifyDenialStatus(claimId, 'Appealed');

    // ── STEP 5: Verify claim status updated to Appealed in Claims ───────────
    await claimsPage.goToClaims();
    await claimsPage.verifyClaimStatus(claimId, 'Appealed');
  });

  test('@e2e Dashboard stats reflect full workflow changes', async ({ page }) => {
    const BASE = process.env.BASE_URL || 'https://YOUR-USERNAME.github.io/maxton-rcm-automation/';
    await page.goto(BASE);

    const dash = new DashboardPage(page);
    const initialPatients = await dash.getPatientCount();
    const initialDenied   = await dash.getDeniedClaimsCount();

    // Register a patient
    const patPage = new PatientPage(page);
    await patPage.goToPatients();
    await patPage.registerPatient(patientData.femalePatient);

    // Submit and deny a claim
    const claimsPage = new ClaimsPage(page);
    await claimsPage.goToClaims();
    const claimId = await claimsPage.createAndSubmitClaim(claimData.labClaim);
    await claimsPage.denyClaim(claimId);

    // Go back to dashboard and verify counts updated
    await dash.goToDashboard();
    await dash.verifyPatientCountIncreased(initialPatients);
    const afterDenied = await dash.getDeniedClaimsCount();
    expect(afterDenied).toBeGreaterThan(initialDenied);
  });
});
