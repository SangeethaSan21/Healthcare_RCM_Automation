import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface VerificationData {
  patientId: string;
  payer: string;
  policyNumber: string;
  coveragePercent: number;
  validUntil: string;   // YYYY-MM-DD
  coPay?: number;
  deductible?: number;
  status: 'Verified' | 'Failed' | 'Pending';
}

export class InsurancePage extends BasePage {
  private readonly verifyBtn      = this.page.locator('[data-testid="verify-insurance-btn"]');
  private readonly saveVerifyBtn  = this.page.locator('[data-testid="save-verification-btn"]');
  private readonly searchInput    = this.page.locator('[data-testid="insurance-search"]');
  private readonly insuranceTbody = this.page.locator('#insurance-tbody');

  constructor(page: Page) {
    super(page);
  }

  async clickVerifyInsurance() {
    await this.verifyBtn.click();
    await this.page.locator('#verify-modal').waitFor({ state: 'visible', timeout: 8000 });
  }

  async fillVerificationForm(data: VerificationData) {
    await this.selectOption('select-patient', data.patientId);
    await this.fillInput('payer-name', data.payer);
    await this.fillInput('verify-policy-number', data.policyNumber);
    await this.fillInput('coverage-percent', String(data.coveragePercent));
    await this.fillInput('valid-until', data.validUntil);
    if (data.coPay !== undefined)      await this.fillInput('co-pay', String(data.coPay));
    if (data.deductible !== undefined) await this.fillInput('deductible', String(data.deductible));
    await this.selectOption('verification-status', data.status);
  }

  async saveVerification() {
    await this.saveVerifyBtn.click();
  }

  async verifyInsurance(data: VerificationData) {
    await this.clickVerifyInsurance();
    await this.fillVerificationForm(data);
    await this.saveVerification();
    await this.verifyToastContains('Insurance verification saved');
  }

  async searchVerification(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyInsuranceStatus(patientName: string, expectedStatus: 'Verified' | 'Failed' | 'Pending') {
    const status = await this.getStatusBadgeText('insurance-tbody', patientName);
    expect(status).toBe(expectedStatus);
  }

  async verifyPolicyVisible(policyNumber: string) {
    const cell = this.insuranceTbody.locator(`[data-testid="policy-number"]:has-text("${policyNumber}")`);
    await expect(cell).toBeVisible();
  }

  async verifyCoveragePercent(patientName: string, percent: number) {
    const row = this.insuranceTbody.locator(`tr:has-text("${patientName}")`).first();
    await expect(row).toContainText(`${percent}%`);
  }

  async verifyRowCount(expected: number) {
    const count = await this.getTableRowCount('insurance-tbody');
    expect(count).toBe(expected);
  }
}
