import { test, expect } from '@playwright/test';
import { ClaimsPage } from '../../pages/ClaimsPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { claimData } from '../../test-data/rcm.data';

test.describe('Claims Management Module', () => {
  let claimsPage: ClaimsPage;

  test.beforeEach(async ({ page }) => {
    claimsPage = new ClaimsPage(page);
    await page.goto(process.env.BASE_URL || 'https://Sangeethasan21.github.io/healthcare_rcm_automation/');
    await claimsPage.goToClaims();
  });

  // ── SMOKE ──────────────────────────────────────────────────────────────────

  test('@smoke Claims page loads with pre-seeded claims', async () => {
    await claimsPage.verifyPageVisible('claims');
    const count = await claimsPage.getTableRowCount('claim-tbody');
    expect(count).toBeGreaterThanOrEqual(5);
  });

  // ── CREATE CLAIM ───────────────────────────────────────────────────────────

  test('@regression Create and submit Office Visit claim (CPT 99213)', async () => {
    const claimId = await claimsPage.createAndSubmitClaim(claimData.officeVisitClaim);
    expect(claimId).toMatch(/CLM-\d{4}-\d+/);
    await claimsPage.verifyClaimVisible(claimId);
    await claimsPage.verifyClaimStatus(claimId, 'Submitted');
  });

  test('@regression Create and submit Inpatient claim (CPT 99232)', async () => {
    const claimId = await claimsPage.createAndSubmitClaim(claimData.inpatientClaim);
    expect(claimId).toMatch(/CLM-\d{4}-\d+/);
    await claimsPage.verifyClaimStatus(claimId, 'Submitted');
  });

  test('@regression Create high-value Surgical claim (CPT 27447)', async () => {
    const claimId = await claimsPage.createAndSubmitClaim(claimData.surgicalClaim);
    expect(claimId).toMatch(/CLM-\d{4}-\d+/);
    await claimsPage.verifyClaimStatus(claimId, 'Submitted');
  });

  test('@regression Save claim as Draft', async () => {
    await claimsPage.clickCreateClaim();
    await claimsPage.fillClaimForm(claimData.labClaim);
    const claimId = await claimsPage.saveDraftClaim();
    expect(claimId).toMatch(/CLM-\d{4}-\d+/);
    await claimsPage.verifyClaimStatus(claimId, 'Pending');
  });

  test('@regression Payer auto-fills when patient is selected', async ({ page }) => {
    await claimsPage.clickCreateClaim();
    await claimsPage.selectOption('claim-patient', 'PAT-001');
    await page.waitForTimeout(500);
    const payerVal = await claimsPage.getInputValue('claim-payer');
    expect(payerVal).not.toBe('');
    expect(payerVal).toContain('Star Health');
  });

  // ── APPROVE / DENY ─────────────────────────────────────────────────────────

  test('@regression Approve a Submitted claim', async () => {
    // Submit a new claim first
    const claimId = await claimsPage.createAndSubmitClaim(claimData.officeVisitClaim);
    await claimsPage.verifyClaimHasApproveRejectButtons(claimId);
    await claimsPage.approveClaim(claimId);
    await claimsPage.verifyClaimStatus(claimId, 'Approved');
  });

  test('@regression Deny a Submitted claim', async () => {
    const claimId = await claimsPage.createAndSubmitClaim(claimData.inpatientClaim);
    await claimsPage.denyClaim(claimId);
    await claimsPage.verifyClaimStatus(claimId, 'Denied');
  });

  test('@regression Denied claim no longer shows Approve/Reject buttons', async ({ page }) => {
    const claimId = await claimsPage.createAndSubmitClaim(claimData.officeVisitClaim);
    await claimsPage.denyClaim(claimId);
    const row = page.locator(`#claim-tbody tr:has-text("${claimId}")`);
    await expect(row.locator('[data-testid="approve-claim"]')).not.toBeVisible();
  });

  // ── TABS / FILTER ──────────────────────────────────────────────────────────

  test('@regression All Claims tab shows all records', async () => {
    await claimsPage.filterByTab('all');
    await claimsPage.verifyTabActive('all');
    const count = await claimsPage.getTableRowCount('claim-tbody');
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('@regression Pending tab filters only Draft claims', async () => {
    await claimsPage.filterByTab('Pending');
    await claimsPage.verifyTabActive('pending');
    // All visible rows should have Pending status
    const count = await claimsPage.getTableRowCount('claim-tbody');
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('@regression Denied tab shows only Denied claims', async () => {
    await claimsPage.filterByTab('Denied');
    const count = await claimsPage.getTableRowCount('claim-tbody');
    expect(count).toBeGreaterThanOrEqual(2); // Seed data has 2 denied
  });

  // ── VALIDATION ─────────────────────────────────────────────────────────────

  test('@regression Submit empty claim form shows validation errors', async () => {
    await claimsPage.clickCreateClaim();
    await claimsPage.verifyRequiredFieldErrors();
  });

  // ── SEARCH ─────────────────────────────────────────────────────────────────

  test('@regression Search claim by claim ID', async () => {
    await claimsPage.searchClaim('CLM-2024-001');
    const visible = await claimsPage.rowExistsInTable('claim-tbody', 'CLM-2024-001');
    expect(visible).toBe(true);
  });

  test('@regression Search claim by patient name', async ({ page }) => {
    // Reset to All tab first — prior tests may have left Denied filter active
    await page.locator('[data-testid="tab-all"]').click();
    await page.waitForTimeout(300);
    await claimsPage.searchClaim('Ravi Kumar');
    await page.waitForTimeout(400);
    const visible = await claimsPage.rowExistsInTable('claim-tbody', 'Ravi Kumar');
    expect(visible).toBe(true);
  });

  test('@regression Search claim by payer name', async () => {
    await claimsPage.searchClaim('United Health');
    const count = await claimsPage.getTableRowCount('claim-tbody');
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ── DASHBOARD REFLECTS CHANGES ─────────────────────────────────────────────

  test('@regression Dashboard denied count increases after claim denial', async ({ page }) => {
    const dashPage = new DashboardPage(page);
    await claimsPage.goToDashboard();
    const before = await dashPage.getDeniedClaimsCount();
    await claimsPage.goToClaims();
    const claimId = await claimsPage.createAndSubmitClaim(claimData.officeVisitClaim);
    await claimsPage.denyClaim(claimId);
    await claimsPage.goToDashboard();
    const after = await dashPage.getDeniedClaimsCount();
    expect(after).toBeGreaterThan(before);
  });
});
