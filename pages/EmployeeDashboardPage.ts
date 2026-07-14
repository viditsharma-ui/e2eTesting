import { Page, Locator } from '@playwright/test'

export class EmployeeDashboardPage {
  page: Page
  balanceAnnual: Locator
  balanceSick: Locator
  balanceCasual: Locator
  recentRequestsTable: Locator
  applyLeaveLink: Locator
  historyLink: Locator
  logoutBtn: Locator
  statusBadges: Locator

  constructor(page: Page) {
    this.page = page
    this.balanceAnnual = page.getByTestId('balance-Annual')
    this.balanceSick = page.getByTestId('balance-Sick')
    this.balanceCasual = page.getByTestId('balance-Casual')
    this.recentRequestsTable = page.locator('#recent-requests-table')
    this.applyLeaveLink = page.locator('#applyLeaveLink')
    this.historyLink = page.locator('#historyLink')
    this.logoutBtn = page.locator('#logoutBtn')
    this.statusBadges = page.locator('[id^="status-badge"]')
  }

  async goto() {
    await this.page.goto('/employee/dashboard')
  }

  async getBalance(leaveType: string): Promise<string> {
    let balanceCard: Locator

    switch (leaveType) {
      case 'Annual':
        balanceCard = this.balanceAnnual
        break
      case 'Sick':
        balanceCard = this.balanceSick
        break
      case 'Casual':
        balanceCard = this.balanceCasual
        break
      default:
        throw new Error(`Unknown leave type: ${leaveType}`)
    }

    return await balanceCard.innerText()
  }

  async getStatusBadges(): Promise<string[]> {
    const count = await this.statusBadges.count()
    const badges: string[] = []

    for (let i = 0; i < count; i++) {
      const text = await this.statusBadges.nth(i).innerText()
      badges.push(text)
    }

    return badges
  }

  async clickApplyLeave() {
    await this.applyLeaveLink.click()
  }

  async clickHistory() {
    await this.historyLink.click()
  }

  async logout() {
    await this.logoutBtn.click()
  }
}
