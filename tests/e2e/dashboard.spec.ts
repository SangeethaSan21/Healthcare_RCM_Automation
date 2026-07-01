import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { PatientPage } from '../../pages/PatientPage';
import { ClaimsPage } from '../../pages/ClaimsPage';
import { patientData, claimData } from '../../test-data/rcm.data';

test.describe('Dashboard Module', () => {
  let dashPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashPage = new DashboardPage(page);
    await page.goto(process.env.BASE_URL || 'https://SangeethaSan21.github.io/healthcare_rcm_automation/');
  });

  test('@smoke Dashboard loads with all stat cards', async () => {
    await dashPage.verifyDashboardLoaded();
  });

  test('@smoke Dashboard shows correct initial patient count', async () => {
    const count = await dashPage.getPatientCount();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('@smoke Dashboard activity table has 4 module rows', async () => {
    await dashPage.verifyActivityTableHasRows();
  });

  test('@regression Dashboard navigate to Patients from activity table', async () => {
    await dashPage.navigateToModuleFromDashboard('patients');
    await dashPage.verifyPageVisible('patients');
  });

  test('@regression Dashboard navigate to Claims from activity table', async () => {
    await dashPage.navigateToModuleFromDashboard('claims');
    await dashPage.verifyPageVisible('claims');
  });

  test('@regression Dashboard navigate to Denials from activity table', async () => {
    await dashPage.navigateToModuleFromDashboard('denials');
    await dashPage.verifyPageVisible('denials');
  });

  test('@regression Patient stat updates after new registration', async ({ page }) => {
    const before = await dashPage.getPatientCount();
    const patPage = new PatientPage(page);
    await patPage.goToPatients();
    await patPage.registerPatient(patientData.validPatient);
    await patPage.goToDashboard();
    await dashPage.verifyPatientCountIncreased(before);
  });

  test('@regression Denied claims count updates after denial', async ({ page }) => {
    const before = await dashPage.getDeniedClaimsCount();
    const claimsPage = new ClaimsPage(page);
    await claimsPage.goToClaims();
    const claimId = await claimsPage.createAndSubmitClaim(claimData.officeVisitClaim);
    await claimsPage.denyClaim(claimId);
    await claimsPage.goToDashboard();
    const after = await dashPage.getDeniedClaimsCount();
    expect(after).toBeGreaterThan(before);
  });

  test('@regression AR calls count shows on dashboard', async () => {
    const count = await dashPage.getARCallsCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
