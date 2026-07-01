import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PatientData {
  firstName: string;
  lastName: string;
  dob: string;              // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address?: string;
  insuranceProvider: string;
  policyNumber: string;
  referringPhysician?: string;
  admissionDate?: string;
}

export class PatientPage extends BasePage {
  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly registerBtn   = this.page.locator('[data-testid="register-patient-btn"]');
  private readonly saveBtn       = this.page.locator('[data-testid="save-patient-btn"]');
  private readonly patientTbody  = this.page.locator('#patient-tbody');
  private readonly searchInput   = this.page.locator('[data-testid="patient-search"]');

  constructor(page: Page) {
    super(page);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async clickRegisterPatient() {
    await this.registerBtn.click();
    // Wait for modal to open
    await this.page.locator('#patient-modal').waitFor({ state: 'visible', timeout: 8000 });
  }

  async fillPatientForm(data: PatientData) {
    await this.fillInput('first-name', data.firstName);
    await this.fillInput('last-name', data.lastName);
    await this.fillInput('dob', data.dob);
    await this.selectOption('gender', data.gender);
    await this.fillInput('phone', data.phone);
    if (data.email)     await this.fillInput('email', data.email);
    if (data.address)   await this.fillInput('address', data.address);
    await this.selectOption('insurance-provider', data.insuranceProvider);
    await this.fillInput('patient-policy-number', data.policyNumber);
    if (data.referringPhysician) await this.fillInput('referring-physician', data.referringPhysician);
    if (data.admissionDate)      await this.fillInput('admission-date', data.admissionDate);
  }

  async savePatient() {
    await this.saveBtn.click();
  }

  async registerPatient(data: PatientData): Promise<string> {
    await this.clickRegisterPatient();
    await this.fillPatientForm(data);
    await this.savePatient();
    const toast = await this.waitForToast();
    // Extract Patient ID from toast: "Patient PAT-005 registered successfully"
    const match = toast.match(/PAT-\d+/);
    return match ? match[0] : '';
  }

  async searchPatient(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  async getPatientRowCount(): Promise<number> {
    return this.getTableRowCount('patient-tbody');
  }

  async togglePatientStatus(patientId: string) {
    const row = this.patientTbody.locator(`tr:has-text("${patientId}")`);
    await row.locator('[data-testid="toggle-patient"]').click();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyPatientExists(patientId: string) {
    const row = this.patientTbody.locator(`tr:has-text("${patientId}")`);
    await expect(row).toBeVisible();
  }

  async verifyPatientNotVisible(patientId: string) {
    const row = this.patientTbody.locator(`tr:has-text("${patientId}")`);
    await expect(row).not.toBeVisible();
  }

  async verifyPatientStatus(patientId: string, expectedStatus: 'Active' | 'Inactive') {
    const status = await this.getStatusBadgeText('patient-tbody', patientId);
    expect(status).toBe(expectedStatus);
  }

  async verifyFieldError(fieldId: string) {
    const err = this.page.locator(`#err-${fieldId}`);
    await expect(err).toBeVisible();
  }

  async verifyModalClosed() {
    await this.page.locator('#patient-modal').waitFor({ state: 'hidden', timeout: 5000 });
  }
}
