import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PaymentData {
  claimId: string;
  paidAmount: number;
  paymentType?: string;
  paymentDate: string;   // YYYY-MM-DD
  referenceNumber?: string;
}

export class PaymentPage extends BasePage {
  private readonly postPaymentBtn    = this.page.locator('[data-testid="post-payment-btn"]');
  private readonly confirmPaymentBtn = this.page.locator('[data-testid="post-payment-confirm-btn"]');
  private readonly paymentTbody      = this.page.locator('#payment-tbody');
  private readonly searchInput       = this.page.locator('[data-testid="payment-search"]');

  constructor(page: Page) {
    super(page);
  }

  async clickPostPayment() {
    await this.postPaymentBtn.click();
    await this.page.locator('#payment-modal').waitFor({ state: 'visible', timeout: 8000 });
  }

  async fillPaymentForm(data: PaymentData) {
    await this.selectOption('pay-claim-id', data.claimId);
    await this.page.waitForTimeout(400); // Wait for autofill (patient, payer, charged)
    await this.fillInput('pay-amount', String(data.paidAmount));
    await this.page.waitForTimeout(200); // Wait for balance calc
    if (data.paymentType)    await this.selectOption('payment-type', data.paymentType);
    await this.fillInput('payment-date', data.paymentDate);
    if (data.referenceNumber) await this.fillInput('pay-reference', data.referenceNumber);
  }

  async confirmPayment() {
    await this.confirmPaymentBtn.click();
    await this.verifyToastContains('Payment');
  }

  async postPayment(data: PaymentData) {
    await this.clickPostPayment();
    await this.fillPaymentForm(data);
    await this.confirmPayment();
  }

  async searchPayment(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  // ── Balance auto-calc ─────────────────────────────────────────────────────

  async getAutoFilledChargedAmount(): Promise<string> {
    return this.getInputValue('pay-charged');
  }

  async getCalculatedBalance(): Promise<string> {
    return this.getInputValue('pay-balance');
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyPaymentPosted(claimId: string) {
    // Use first() — multiple payments against same claim ID is valid (e.g. partial + co-pay)
    const row = this.paymentTbody.locator(`tr:has-text("${claimId}")`).first();
    await expect(row).toBeVisible();
  }

  async verifyPaymentStatus(claimId: string, expectedStatus: 'Paid' | 'Partial') {
    const row = this.paymentTbody.locator(`tr:has-text("${claimId}")`).first();
    const status = await row.locator('[data-testid="status-badge"]').innerText();
    expect(status).toBe(expectedStatus);
  }

  async verifyAutoFillOnClaimSelect(claimId: string) {
    await this.selectOption('pay-claim-id', claimId);
    await this.page.waitForTimeout(400);
    const patient = await this.getInputValue('pay-patient');
    const payer   = await this.getInputValue('pay-payer');
    const charged = await this.getInputValue('pay-charged'); // auto-filled in modal, shows ₹ prefix
    expect(patient).not.toBe('');
    expect(payer).not.toBe('');
    expect(charged).not.toBe('');
  }

  async verifyBalanceCalculation(chargedAmount: number, paidAmount: number) {
    const expected = chargedAmount - paidAmount;
    const balance  = await this.getCalculatedBalance();
    expect(balance).toContain(expected.toLocaleString('en-IN'));
  }
}
