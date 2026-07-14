import { Page, Locator } from '@playwright/test'

export class ManagerDashboardPage {
  page: Page
  pendingTable: Locator
  logoutBtn: Locator
  toast: Locator

  constructor(page: Page) {
    this.page = page
    this.pendingTable = page.locator('#pending-requests-table')
    this.logoutBtn = page.locator('#logoutBtn')
    this.toast = page.locator('#toast-container')
  }

  async goto() {
    await this.page.goto('/manager/dashboard')
  }

  approveBtn(id: string): Locator {
    return this.page.getByTestId(`approve-btn-${id}`)
  }

  rejectBtn(id: string): Locator {
    return this.page.getByTestId(`reject-btn-${id}`)
  }

  async approveRequest(requestId: string) {
    await this.approveBtn(requestId).click()
  }

  async rejectRequest(requestId: string) {
    await this.rejectBtn(requestId).click()
  }

  async getPendingCount(): Promise<number> {
    return await this.pendingTable.locator('tbody tr').count()
  }
}
