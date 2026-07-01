import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // ── Stat card locators ────────────────────────────────────────────────────
  private readonly statPatients  = this.page.locator('#st-patients');
  private readonly statVerif     = this.page.locator('#st-verif');
  private readonly statClaims    = this.page.locator('#st-claims');
  private readonly statDenied    = this.page.locator('#st-denied');
  private readonly statPayments  = this.page.locator('#st-payments');
  private readonly statAR        = this.page.locator('#st-ar');
  private readonly statCalls     = this.page.locator('#st-calls');
  private readonly statAppeals   = this.page.locator('#st-appeals');
  private readonly dashTbody     = this.page.locator('#dash-tbody');

  constructor(page: Page) {
    super(page);
  }

  async open(filePath: string) {
    await this.page.goto(filePath);
    await this.waitForPageLoad();
    await this.verifyPageVisible('dashboard');
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  async getPatientCount(): Promise<number> {
    return parseInt(await this.statPatients.innerText());
  }
  async getPendingVerifications(): Promise<number> {
    return parseInt(await this.statVerif.innerText());
  }
  async getSubmittedClaimsCount(): Promise<number> {
    return parseInt(await this.statClaims.innerText());
  }
  async getDeniedClaimsCount(): Promise<number> {
    return parseInt(await this.statDenied.innerText());
  }
  async getARCallsCount(): Promise<number> {
    return parseInt(await this.statCalls.innerText());
  }
  async getAppealsCount(): Promise<number> {
    return parseInt(await this.statAppeals.innerText());
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyDashboardLoaded() {
    await expect(this.statPatients).toBeVisible();
    await expect(this.statClaims).toBeVisible();
    await expect(this.dashTbody).toBeVisible();
  }

  async verifyPatientCountIncreased(previousCount: number) {
    const current = await this.getPatientCount();
    expect(current).toBeGreaterThan(previousCount);
  }

  async verifySubmittedClaimsCount(expected: number) {
    const count = await this.getSubmittedClaimsCount();
    expect(count).toBe(expected);
  }

  async verifyDeniedClaimsCount(expected: number) {
    const count = await this.getDeniedClaimsCount();
    expect(count).toBe(expected);
  }

  async verifyActivityTableHasRows() {
    const rows = this.dashTbody.locator('tr');
    await expect(rows).toHaveCount(4); // 4 modules always shown
  }

  async navigateToModuleFromDashboard(module: 'patients' | 'insurance' | 'claims' | 'denials') {
    const row = this.dashTbody.locator(`tr:has-text("${
      module === 'patients' ? 'Patient Registration'
      : module === 'insurance' ? 'Insurance Verification'
      : module === 'claims' ? 'Claims Management'
      : 'Denial Management'
    }")`);
    await row.locator('button').click();
    await this.page.waitForTimeout(300);
  }
}
