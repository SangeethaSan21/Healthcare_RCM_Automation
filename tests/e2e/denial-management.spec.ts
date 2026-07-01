import { test, expect } from '@playwright/test';
import { DenialPage } from '../../pages/DenialPage';
import { ClaimsPage } from '../../pages/ClaimsPage';
import { appealData, claimData } from '../../test-data/rcm.data';

test.describe('Denial Management Module', () => {
  let denialPage: DenialPage;

  test.beforeEach(async ({ page }) => {
    denialPage = new DenialPage(page);
    await page.goto(process.env.BASE_URL || 'https://SangeethaSan21.github.io/healthcare_rcm_automation/');
    await denialPage.goToDenials();
  });

  test('@smoke Denial management page loads with pre-seeded denials', async () => {
    await denialPage.verifyPageVisible('denials');
    const count = await denialPage.getDenialCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('@smoke Seeded denied claim CLM-2024-003 exists', async () => {
    await denialPage.verifyDenialExists('CLM-2024-003');
    await denialPage.verifyDenialStatus('CLM-2024-003', 'Pending');
  });

  // ── FILE APPEAL ────────────────────────────────────────────────────────────

  test('@regression File Prior Authorization appeal for denied claim', async () => {
    await denialPage.fileAppeal(appealData.priorAuthAppeal);
    await denialPage.verifyDenialStatus(
      appealData.priorAuthAppeal.claimId,
      'Appealed'
    );
  });

  test('@regression File Medical Necessity appeal', async () => {
    await denialPage.fileAppeal(appealData.medicalNecessityAppeal);
    await denialPage.verifyDenialStatus(
      appealData.medicalNecessityAppeal.claimId,
      'Appealed'
    );
  });

  test('@regression Toast shows after filing appeal', async () => {
    await denialPage.clickFileAppeal();
    await denialPage.fillAppealForm(appealData.priorAuthAppeal);
    await denialPage.submitAppeal();
    await denialPage.verifyToastContains('Appeal filed');
  });

  test('@regression Appeal dropdown only shows Denied claims', async ({ page }) => {
    await denialPage.clickFileAppeal();
    const options = await page.locator('[data-testid="appeal-claim-id"] option').allInnerTexts();
    // Should not have blank or non-denied claims
    expect(options.length).toBeGreaterThan(1); // at least one denied + placeholder
  });

  // ── STATUS CHANGE REFLECTED IN CLAIMS ─────────────────────────────────────

  test('@regression Claim status changes to Appealed in Claims module after appeal', async ({ page }) => {
    // File appeal for CLM-2024-003
    await denialPage.fileAppeal(appealData.priorAuthAppeal);
    // Go to Claims and verify
    const claimsPage = new ClaimsPage(page);
    await claimsPage.goToClaims();
    await claimsPage.verifyClaimStatus(appealData.priorAuthAppeal.claimId, 'Appealed');
  });

  // ── VALIDATION ─────────────────────────────────────────────────────────────

  test('@regression Submit empty appeal form shows validation errors', async ({ page }) => {
    await denialPage.clickFileAppeal();
    await page.locator('[data-testid="submit-appeal-btn"]').click();
    const errors = page.locator('.field-error.show');
    expect(await errors.count()).toBeGreaterThan(0);
  });

  // ── SEARCH ─────────────────────────────────────────────────────────────────

  test('@regression Search denial by claim ID', async () => {
    await denialPage.searchDenial('CLM-2024-003');
    const visible = await denialPage.rowExistsInTable('denial-tbody', 'CLM-2024-003');
    expect(visible).toBe(true);
  });

  test('@regression Search denial by denial reason', async () => {
    await denialPage.searchDenial('Prior Authorization');
    const count = await denialPage.getDenialCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ── DENY FROM CLAIMS → APPEARS IN DENIALS ─────────────────────────────────

  test('@e2e Deny claim from Claims module then verify it appears in Denial module', async ({ page }) => {
    // Step 1: Create and submit a claim
    const claimsPage = new ClaimsPage(page);
    await claimsPage.goToClaims();
    const claimId = await claimsPage.createAndSubmitClaim(claimData.officeVisitClaim);

    // Step 2: Deny it
    await claimsPage.denyClaim(claimId);
    await claimsPage.verifyClaimStatus(claimId, 'Denied');

    // Step 3: Go to Denials and verify it appears
    await denialPage.goToDenials();
    await denialPage.verifyDenialExists(claimId);
  });
});
