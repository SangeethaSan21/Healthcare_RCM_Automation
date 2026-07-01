import { test, expect } from '@playwright/test';
import { ARCallingPage } from '../../pages/ARCallingPage';
import { arCallData } from '../../test-data/rcm.data';

test.describe('AR Calling Module', () => {
  let arPage: ARCallingPage;

  test.beforeEach(async ({ page }) => {
    arPage = new ARCallingPage(page);
    await page.goto(process.env.BASE_URL || 'https://SangeethaSan21.github.io/healthcare_rcm_automation/');
    await arPage.goToAR();
  });

  test('@smoke AR Calling page loads with pre-seeded calls', async () => {
    await arPage.verifyPageVisible('ar');
    const count = await arPage.getTableRowCount('ar-tbody');
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('@regression Log AR call — Claim in process outcome', async () => {
    await arPage.logCall(arCallData.inProcessCall);
    await arPage.verifyCallLogged(arCallData.inProcessCall.claimId);
    await arPage.verifyCallOutcome(arCallData.inProcessCall.claimId, 'Claim in process');
  });

  test('@regression Log AR call — Additional info requested', async () => {
    await arPage.logCall(arCallData.additionalInfoCall);
    await arPage.verifyCallLogged(arCallData.additionalInfoCall.claimId);
  });

  test('@regression Log AR call — Escalated to supervisor', async () => {
    await arPage.logCall(arCallData.escalatedCall);
    await arPage.verifyCallOutcome(arCallData.escalatedCall.claimId, 'Escalated to supervisor');
  });

  test('@regression Follow-up date is saved with AR call', async () => {
    await arPage.logCall(arCallData.inProcessCall);
    await arPage.verifyFollowUpDate(
      arCallData.inProcessCall.claimId,
      arCallData.inProcessCall.followUpDate!
    );
  });

  test('@regression AR call count increases after logging', async () => {
    const before = await arPage.getARCallCount();
    await arPage.logCall(arCallData.inProcessCall);
    await arPage.verifyARCallCount(before + 1);
  });

  test('@regression Submit empty AR call form shows errors', async ({ page }) => {
    await arPage.clickLogARCall();
    await page.locator('[data-testid="save-call-btn"]').click();
    const errors = page.locator('.field-error.show');
    expect(await errors.count()).toBeGreaterThan(0);
  });

  test('@regression Search AR calls by claim ID', async () => {
    await arPage.searchARCall('CLM-2024-002');
    const visible = await arPage.rowExistsInTable('ar-tbody', 'CLM-2024-002');
    expect(visible).toBe(true);
  });

  test('@regression Search AR calls by payer', async () => {
    await arPage.searchARCall('United Health');
    const count = await arPage.getTableRowCount('ar-tbody');
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('@regression Toast shows after logging call', async () => {
    await arPage.clickLogARCall();
    await arPage.fillARCallForm(arCallData.inProcessCall);
    await arPage.saveARCall();
    await arPage.verifyToastContains('AR Call');
  });
});
