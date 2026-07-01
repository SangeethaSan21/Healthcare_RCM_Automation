import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AppealData {
  claimId: string;
  appealType: string;
  appealDate: string;   // YYYY-MM-DD
  justification: string;
  supportingDocs?: string;
}

export class DenialPage extends BasePage {
  private readonly fileAppealBtn  = this.page.locator('[data-testid="file-appeal-btn"]');
  private readonly submitAppealBtn = this.page.locator('[data-testid="submit-appeal-btn"]');
  private readonly denialTbody    = this.page.locator('#denial-tbody');
  private readonly searchInput    = this.page.locator('[data-testid="denial-search"]');

  constructor(page: Page) {
    super(page);
  }

  async clickFileAppeal() {
    await this.fileAppealBtn.click();
    await this.page.locator('#appeal-modal').waitFor({ state: 'visible', timeout: 8000 });
  }

  async fillAppealForm(data: AppealData) {
    await this.selectOption('appeal-claim-id', data.claimId);
    await this.selectOption('appeal-type', data.appealType);
    await this.fillInput('appeal-date', data.appealDate);
    await this.page.locator('[data-testid="appeal-notes"]').fill(data.justification);
    if (data.supportingDocs) await this.selectOption('supporting-docs', data.supportingDocs);
  }

  async submitAppeal() {
    await this.submitAppealBtn.click();
    await this.verifyToastContains('Appeal filed');
  }

  async fileAppeal(data: AppealData) {
    await this.clickFileAppeal();
    await this.fillAppealForm(data);
    await this.submitAppeal();
  }

  async searchDenial(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyDenialExists(claimId: string) {
    const row = this.denialTbody.locator(`tr:has-text("${claimId}")`);
    await expect(row).toBeVisible();
  }

  async verifyDenialStatus(claimId: string, expectedStatus: 'Pending' | 'Appealed') {
    const status = await this.getStatusBadgeText('denial-tbody', claimId);
    expect(status).toBe(expectedStatus);
  }

  async verifyDenialReason(claimId: string, reason: string) {
    const row = this.denialTbody.locator(`tr:has-text("${claimId}")`);
    await expect(row).toContainText(reason);
  }

  async getDenialCount(): Promise<number> {
    return this.getTableRowCount('denial-tbody');
  }
}
