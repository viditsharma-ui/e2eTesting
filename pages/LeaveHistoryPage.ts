import { Page, Locator } from '@playwright/test'

export class LeaveHistoryPage {
  page: Page
  historyTable: Locator
  tableRows: Locator
  statusBadges: Locator
  cancelButtons: Locator
  toast: Locator

  constructor(page: Page) {
    this.page = page
    this.historyTable = page.locator('#leave-history-table')
    this.tableRows = page.locator('table tbody tr')
    this.statusBadges = page.locator('[id^="status-"]')
    this.cancelButtons = page.locator('[id^="cancelBtn-"]')
    this.toast = page.locator('#toast-container')
  }

  async goto() {
    await this.page.goto('/employee/history')
  }

  async cancelRequest(requestId: string) {
    const cancelBtn = this.page.locator(`#cancelBtn-${requestId}`)
    await cancelBtn.click()
  }

  async getRowStatuses(): Promise<string[]> {
    const count = await this.tableRows.count()
    const statuses: string[] = []

    for (let i = 0; i < count; i++) {
      const row = this.tableRows.nth(i)
      const status = await row.locator('[id^="status-"]').innerText()
      statuses.push(status)
    }

    return statuses
  }

  async hasCancelButton(requestId: string): Promise<boolean> {
    const cancelBtn = this.page.locator(`#cancelBtn-${requestId}`)
    return await cancelBtn.isVisible()
  }
}
