import { test, expect } from '@playwright/test';
import { PatientPage } from '../../pages/PatientPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { patientData } from '../../test-data/rcm.data';

test.describe('Patient Registration Module', () => {
  let patientPage: PatientPage;
  let dashPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    patientPage = new PatientPage(page);
    dashPage    = new DashboardPage(page);
    await page.goto(process.env.BASE_URL || 'https://Sangeethasan21.github.io/healthcare_rcm_automation/');
    await patientPage.goToPatients();
  });

  // ── SMOKE ──────────────────────────────────────────────────────────────────

  test('@smoke Patient list page loads with pre-seeded data', async () => {
    await patientPage.verifyPageVisible('patients');
    const count = await patientPage.getPatientRowCount();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  // ── CREATE ─────────────────────────────────────────────────────────────────

  test('@regression Register a new male patient with Star Health insurance', async () => {
    const patientId = await patientPage.registerPatient(patientData.validPatient);
    expect(patientId).toMatch(/PAT-\d+/);
    await patientPage.verifyPatientExists(patientId);
    await patientPage.verifyPatientStatus(patientId, 'Active');
  });

  test('@regression Register a female patient with United Health Care insurance', async () => {
    const patientId = await patientPage.registerPatient(patientData.femalePatient);
    expect(patientId).toMatch(/PAT-\d+/);
    await patientPage.verifyPatientExists(patientId);
  });

  test('@regression Register patient modal opens on button click', async () => {
    await patientPage.clickRegisterPatient();
    const isOpen = await patientPage.isModalOpen('patient-modal');
    expect(isOpen).toBe(true);
  });

  test('@regression Modal closes on Escape key', async () => {
    await patientPage.clickRegisterPatient();
    await patientPage.closeModalWithEscape();
    await patientPage.verifyModalClosed();
  });

  // ── VALIDATION ─────────────────────────────────────────────────────────────

  test('@regression Submit empty form shows required field errors', async ({ page }) => {
    await patientPage.clickRegisterPatient();
    await page.locator('[data-testid="save-patient-btn"]').click();
    // Verify multiple field errors appear
    const errors = page.locator('.field-error.show');
    const count = await errors.count();
    expect(count).toBeGreaterThan(0);
  });

  test('@regression Toast appears after successful registration', async () => {
    await patientPage.clickRegisterPatient();
    await patientPage.fillPatientForm(patientData.validPatient);
    await patientPage.savePatient();
    await patientPage.verifyToastContains('registered successfully');
  });

  // ── STATUS TOGGLE ──────────────────────────────────────────────────────────

  test('@regression Toggle patient status Active to Inactive', async () => {
    await patientPage.verifyPatientStatus('PAT-001', 'Active');
    await patientPage.togglePatientStatus('PAT-001');
    await patientPage.verifyPatientStatus('PAT-001', 'Inactive');
  });

  test('@regression Toggle patient status Inactive back to Active', async () => {
    // Ensure PAT-004 is inactive (seed data)
    await patientPage.togglePatientStatus('PAT-004');
    await patientPage.verifyPatientStatus('PAT-004', 'Active');
  });

  // ── SEARCH ─────────────────────────────────────────────────────────────────

  test('@regression Search patient by ID returns correct result', async () => {
    await patientPage.searchPatient('PAT-001');
    const visible = await patientPage.rowExistsInTable('patient-tbody', 'PAT-001');
    expect(visible).toBe(true);
  });

  test('@regression Search patient by name', async () => {
    await patientPage.searchPatient('Ravi Kumar');
    const visible = await patientPage.rowExistsInTable('patient-tbody', 'Ravi Kumar');
    expect(visible).toBe(true);
  });

  test('@regression Search with no match shows empty state', async ({ page }) => {
    await patientPage.searchPatient('XXXXXXXX_NOTEXIST');
    const rows = await patientPage.getPatientRowCount();
    expect(rows).toBe(0);
  });

  // ── DASHBOARD REFLECTS COUNT ───────────────────────────────────────────────

  test('@regression Dashboard patient count increases after registration', async ({ page }) => {
    dashPage = new DashboardPage(page);
    await patientPage.goToDashboard();
    const before = await dashPage.getPatientCount();
    await patientPage.goToPatients();
    await patientPage.registerPatient(patientData.femalePatient);
    await patientPage.goToDashboard();
    await dashPage.verifyPatientCountIncreased(before);
  });
});
