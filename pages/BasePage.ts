import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — parent class for all RCM Page Objects.
 * Contains shared helpers used across every module.
 */
export class BasePage {
  constructor(protected page: Page) {}

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigate(path: string = '') {
    await this.page.goto(path || (process.env.BASE_URL as string));
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ── Sidebar navigation ────────────────────────────────────────────────────

  async goToDashboard() {
    await this.page.click('[data-testid="nav-dashboard"]');
    await this.waitForPageLoad();
  }

  async goToPatients() {
    await this.page.click('[data-testid="nav-patients"]');
  }

  async goToInsurance() {
    await this.page.click('[data-testid="nav-insurance"]');
  }

  async goToClaims() {
    await this.page.click('[data-testid="nav-claims"]');
  }

  async goToAR() {
    await this.page.click('[data-testid="nav-ar"]');
  }

  async goToPayments() {
    await this.page.click('[data-testid="nav-payments"]');
  }

  async goToDenials() {
    await this.page.click('[data-testid="nav-denials"]');
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────

  async closeModalWithEscape() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async isModalOpen(modalId: string): Promise<boolean> {
    const modal = this.page.locator(`#${modalId}`);
    return modal.evaluate(el => el.classList.contains('open'));
  }

  // ── Form helpers ──────────────────────────────────────────────────────────

  async fillInput(testId: string, value: string) {
    await this.page.locator(`[data-testid="${testId}"]`).fill(value);
  }

  async selectOption(testId: string, value: string) {
    await this.page.locator(`[data-testid="${testId}"]`).selectOption(value);
  }

  async getInputValue(testId: string): Promise<string> {
    return this.page.locator(`[data-testid="${testId}"]`).inputValue();
  }

  // ── Toast / notification ──────────────────────────────────────────────────

  async waitForToast(): Promise<string> {
    const toast = this.page.locator('#toast');
    await toast.waitFor({ state: 'visible', timeout: 8_000 });
    return toast.locator('#toast-msg').innerText();
  }

  async verifyToastContains(text: string) {
    const msg = await this.waitForToast();
    expect(msg).toContain(text);
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async search(searchTestId: string, keyword: string) {
    const input = this.page.locator(`[data-testid="${searchTestId}"]`);
    await input.clear();
    await input.fill(keyword);
    await this.page.waitForTimeout(400); // debounce
  }

  // ── Table helpers ─────────────────────────────────────────────────────────

  async getTableRowCount(tbodyId: string): Promise<number> {
    return this.page.locator(`#${tbodyId} tr[data-testid]`).count();
  }

  async rowExistsInTable(tbodyId: string, text: string): Promise<boolean> {
    const row = this.page.locator(`#${tbodyId} tr:has-text("${text}")`).first();
    return row.isVisible().catch(() => false);
  }

  async getStatusBadgeText(tbodyId: string, rowText: string): Promise<string> {
    // .first() handles cases where same patient/claim appears multiple times
    // due to accumulated test data in a stateful app
    const row = this.page.locator(`#${tbodyId} tr:has-text("${rowText}")`).first();
    return row.locator('[data-testid="status-badge"]').first().innerText();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyPageVisible(pageId: string) {
    await expect(this.page.locator(`#page-${pageId}`)).toBeVisible();
  }

  async verifySidebarBadgeCount(testId: string, expected: number) {
    const badge = this.page.locator(`[data-testid="${testId}"] .badge-count`);
    if (expected === 0) return; // badge may be hidden
    await expect(badge).toContainText(String(expected));
  }

  async captureScreenshot(label: string) {
    await this.page.screenshot({
      path: `reports/screenshots/${label}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}
