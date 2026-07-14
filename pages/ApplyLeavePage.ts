import { Page, Locator } from '@playwright/test'

export class ApplyLeavePage {
  page: Page
  leaveType: Locator
  startDate: Locator
  endDate: Locator
  reason: Locator
  submitLeave: Locator
  dateError: Locator
  reasonError: Locator
  toast: Locator

  constructor(page: Page) {
    this.page = page
    this.leaveType = page.locator('#leaveType')
    this.startDate = page.locator('#startDate')
    this.endDate = page.locator('#endDate')
    this.reason = page.locator('#reason')
    this.submitLeave = page.locator('#submitLeave')
    this.dateError = page.locator('#dateError')
    this.reasonError = page.locator('#reasonError')
    this.toast = page.locator('#toast-container')
  }

  async goto() {
    await this.page.goto('/employee/apply')
  }

  async fillAndSubmit(leaveType: string, startDate: string, endDate: string, reason: string) {
    await this.leaveType.selectOption(leaveType)
    await this.startDate.fill(startDate)
    await this.endDate.fill(endDate)
    await this.reason.fill(reason)
    await this.submitLeave.click()
  }

  async getValidationErrors(): Promise<{ dateError: string | null; reasonError: string | null }> {
    const dateErrorText = await this.dateError.isVisible() ? await this.dateError.innerText() : null
    const reasonErrorText = await this.reasonError.isVisible() ? await this.reasonError.innerText() : null

    return {
      dateError: dateErrorText,
      reasonError: reasonErrorText,
    }
  }
}
