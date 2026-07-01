import { test, expect } from '@playwright/test';
import { InsurancePage } from '../../pages/InsurancePage';
import { verificationData } from '../../test-data/rcm.data';

test.describe('Insurance Verification Module', () => {
  let insurancePage: InsurancePage;

  test.beforeEach(async ({ page }) => {
    insurancePage = new InsurancePage(page);
    await page.goto(process.env.BASE_URL || 'https://SangeethaSan21.github.io/healthcare_rcm_automation/');
    await insurancePage.goToInsurance();
  });

  test('@smoke Insurance verification page loads', async () => {
    await insurancePage.verifyPageVisible('insurance');
    const count = await insurancePage.getTableRowCount('insurance-tbody');
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('@regression Verify insurance as Verified status', async () => {
    await insurancePage.verifyInsurance(verificationData.verifiedInsurance);
    await insurancePage.verifyInsuranceStatus('PAT-001', 'Verified');
  });

  test('@regression Save insurance verification as Failed', async () => {
    await insurancePage.verifyInsurance(verificationData.failedInsurance);
    await insurancePage.verifyInsuranceStatus('PAT-002', 'Failed');
  });

  test('@regression Save insurance verification as Pending', async () => {
    await insurancePage.verifyInsurance(verificationData.pendingInsurance);
    await insurancePage.verifyInsuranceStatus('PAT-003', 'Pending');
  });

  test('@regression Coverage percentage is saved correctly', async () => {
    await insurancePage.verifyInsurance(verificationData.verifiedInsurance);
    await insurancePage.verifyCoveragePercent('PAT-001', verificationData.verifiedInsurance.coveragePercent);
  });

  test('@regression Policy number is visible in verification list', async () => {
    await insurancePage.verifyInsurance(verificationData.verifiedInsurance);
    await insurancePage.verifyPolicyVisible(verificationData.verifiedInsurance.policyNumber);
  });

  test('@regression Submit empty verification form shows validation errors', async ({ page }) => {
    await insurancePage.clickVerifyInsurance();
    await page.locator('[data-testid="save-verification-btn"]').click();
    const errors = page.locator('.field-error.show');
    expect(await errors.count()).toBeGreaterThan(0);
  });

  test('@regression Search verification by patient name', async () => {
    await insurancePage.searchVerification('Ravi Kumar');
    const visible = await insurancePage.rowExistsInTable('insurance-tbody', 'Ravi Kumar');
    expect(visible).toBe(true);
  });

  test('@regression Search verification by payer name', async () => {
    await insurancePage.searchVerification('Star Health');
    const visible = await insurancePage.rowExistsInTable('insurance-tbody', 'Star Health');
    expect(visible).toBe(true);
  });

  test('@regression Toast shows after saving verification', async () => {
    await insurancePage.clickVerifyInsurance();
    await insurancePage.fillVerificationForm(verificationData.verifiedInsurance);
    await insurancePage.saveVerification();
    await insurancePage.verifyToastContains('Insurance verification saved');
  });
});
