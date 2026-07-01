import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ARCallData {
  claimId: string;
  payer: string;
  callDate: string;   // YYYY-MM-DD
  agentName: string;
  outcome: string;
  followUpDate?: string;
  notes?: string;
}

export class ARCallingPage extends BasePage {
  private readonly logCallBtn  = this.page.locator('[data-testid="log-call-btn"]');
  private readonly saveCallBtn = this.page.locator('[data-testid="save-call-btn"]');
  private readonly arTbody     = this.page.locator('#ar-tbody');
  private readonly searchInput = this.page.locator('[data-testid="ar-search"]');

  constructor(page: Page) {
    super(page);
  }

  async clickLogARCall() {
    await this.logCallBtn.click();
    await this.page.locator('#call-modal').waitFor({ state: 'visible', timeout: 8000 });
  }

  async fillARCallForm(data: ARCallData) {
    await this.selectOption('ar-claim-id', data.claimId);
    await this.fillInput('ar-payer', data.payer);
    await this.fillInput('ar-call-date', data.callDate);
    await this.fillInput('ar-agent', data.agentName);
    await this.selectOption('ar-outcome', data.outcome);
    if (data.followUpDate) await this.fillInput('ar-followup-date', data.followUpDate);
    if (data.notes)        await this.fillInput('ar-notes', data.notes);
  }

  async saveARCall() {
    await this.saveCallBtn.click();
    await this.verifyToastContains('AR Call');
  }

  async logCall(data: ARCallData) {
    await this.clickLogARCall();
    await this.fillARCallForm(data);
    await this.saveARCall();
  }

  async searchARCall(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyCallLogged(claimId: string) {
    const row = this.arTbody.locator(`tr:has-text("${claimId}")`).first();
    await expect(row).toBeVisible();
  }

  async verifyCallOutcome(claimId: string, outcome: string) {
    const row = this.arTbody.locator(`tr:has-text("${claimId}")`).first();
    await expect(row).toContainText(outcome);
  }

  async verifyFollowUpDate(claimId: string, date: string) {
    const row = this.arTbody.locator(`tr:has-text("${claimId}")`).first();
    await expect(row).toContainText(date);
  }

  async verifyARCallCount(expected: number) {
    const count = await this.getTableRowCount('ar-tbody');
    expect(count).toBeGreaterThanOrEqual(expected);
  }

  async getARCallCount(): Promise<number> {
    return this.getTableRowCount('ar-tbody');
  }
}
