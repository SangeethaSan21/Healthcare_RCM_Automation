import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ClaimData {
  patientId: string;
  payer: string;
  cptCode: string;
  icdCode: string;
  dateOfService: string;   // YYYY-MM-DD
  chargeAmount: number;
  renderingProvider: string;
  placeOfService?: string;
  clinicalNotes?: string;
}

export class ClaimsPage extends BasePage {
  private readonly createClaimBtn = this.page.locator('[data-testid="create-claim-btn"]');
  private readonly submitClaimBtn = this.page.locator('[data-testid="submit-claim-btn"]');
  private readonly saveDraftBtn   = this.page.locator('[data-testid="save-draft-claim-btn"]');
  private readonly claimTbody     = this.page.locator('#claim-tbody');
  private readonly searchInput    = this.page.locator('[data-testid="claim-search"]');

  constructor(page: Page) {
    super(page);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async clickCreateClaim() {
    await this.createClaimBtn.click();
    await this.page.locator('#claim-modal').waitFor({ state: 'visible', timeout: 8000 });
  }

  async fillClaimForm(data: ClaimData) {
    await this.selectOption('claim-patient', data.patientId);
    // payer auto-fills from patient — but can be overridden
    await this.page.waitForTimeout(300);
    const payerVal = await this.getInputValue('claim-payer');
    if (!payerVal) await this.fillInput('claim-payer', data.payer);

    await this.selectOption('cpt-code', data.cptCode);
    await this.selectOption('icd-code', data.icdCode);
    await this.fillInput('date-of-service', data.dateOfService);
    await this.fillInput('charge-amount', String(data.chargeAmount));
    await this.selectOption('rendering-provider', data.renderingProvider);
    if (data.placeOfService) await this.selectOption('place-of-service', data.placeOfService);
    if (data.clinicalNotes)  await this.fillInput('clinical-notes', data.clinicalNotes);
  }

  async submitClaim(): Promise<string> {
    await this.submitClaimBtn.click();
    const toast = await this.waitForToast();
    const match = toast.match(/CLM-\d{4}-\d+/);
    return match ? match[0] : '';
  }

  async saveDraftClaim(): Promise<string> {
    await this.saveDraftBtn.click();
    const toast = await this.waitForToast();
    const match = toast.match(/CLM-\d{4}-\d+/);
    return match ? match[0] : '';
  }

  async createAndSubmitClaim(data: ClaimData): Promise<string> {
    await this.clickCreateClaim();
    await this.fillClaimForm(data);
    return this.submitClaim();
  }

  async approveClaim(claimId: string) {
    const row = this.claimTbody.locator(`tr:has-text("${claimId}")`);
    await row.locator('[data-testid="approve-claim"]').click();
    await this.verifyToastContains('approved');
  }

  async denyClaim(claimId: string) {
    const row = this.claimTbody.locator(`tr:has-text("${claimId}")`);
    await row.locator('[data-testid="deny-claim"]').click();
    await this.verifyToastContains('denied');
  }

  async filterByTab(tab: 'all' | 'Pending' | 'Submitted' | 'Approved' | 'Denied') {
    const testIdMap: Record<string, string> = {
      all: 'tab-all', Pending: 'tab-pending', Submitted: 'tab-submitted',
      Approved: 'tab-approved', Denied: 'tab-denied',
    };
    await this.page.locator(`[data-testid="${testIdMap[tab]}"]`).click();
    await this.page.waitForTimeout(300);
  }

  async searchClaim(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyClaimStatus(claimId: string, expectedStatus: 'Pending' | 'Submitted' | 'Approved' | 'Denied' | 'Appealed') {
    const status = await this.getStatusBadgeText('claim-tbody', claimId);
    expect(status).toBe(expectedStatus);
  }

  async verifyClaimVisible(claimId: string) {
    const row = this.claimTbody.locator(`tr:has-text("${claimId}")`);
    await expect(row).toBeVisible();
  }

  async verifyClaimNotVisible(claimId: string) {
    const row = this.claimTbody.locator(`tr:has-text("${claimId}")`);
    await expect(row).not.toBeVisible();
  }

  async verifyClaimHasApproveRejectButtons(claimId: string) {
    const row = this.claimTbody.locator(`tr:has-text("${claimId}")`);
    await expect(row.locator('[data-testid="approve-claim"]')).toBeVisible();
    await expect(row.locator('[data-testid="deny-claim"]')).toBeVisible();
  }

  async verifyRequiredFieldErrors() {
    // Submit without filling — all required field errors should show
    await this.submitClaimBtn.click();
    const errors = this.page.locator('.field-error.show');
    const count = await errors.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyTabActive(tab: string) {
    const btn = this.page.locator(`[data-testid="tab-${tab.toLowerCase()}"]`);
    await expect(btn).toHaveClass(/active/);
  }
}
