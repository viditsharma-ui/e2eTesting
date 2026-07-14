import { test, expect } from '@playwright/test'
import { LeaveLoginPage } from '../pages/LeaveLoginPage.js'
import { EmployeeDashboardPage } from '../pages/EmployeeDashboardPage.js'
import { ApplyLeavePage } from '../pages/ApplyLeavePage.js'
import { LeaveHistoryPage } from '../pages/LeaveHistoryPage.js'
import leavedata from '../testdata/leavedata.json' with { type: 'json' }

const employeeEmail = leavedata.employee.email
const employeePassword = leavedata.employee.password

let leaveLoginPage: LeaveLoginPage
let employeeDashboardPage: EmployeeDashboardPage
let applyLeavePage: ApplyLeavePage
let leaveHistoryPage: LeaveHistoryPage

test.beforeEach(async ({ page }) => {
  leaveLoginPage = new LeaveLoginPage(page)
  employeeDashboardPage = new EmployeeDashboardPage(page)
  applyLeavePage = new ApplyLeavePage(page)
  leaveHistoryPage = new LeaveHistoryPage(page)

  // Login as employee
  await leaveLoginPage.goto()
  await leaveLoginPage.login(employeeEmail, employeePassword)
  // Wait for navigation to employee dashboard
  await page.waitForURL('**/employee/dashboard')
})

test('Employee Dashboard - Balance visible and 3 leave types shown', { tag: '@smoke' }, async () => {
  // Navigate to dashboard (already logged in from beforeEach)
  await employeeDashboardPage.goto()

  // Verify balance cards for all three leave types are visible
  await expect(employeeDashboardPage.balanceAnnual).toBeVisible()
  await expect(employeeDashboardPage.balanceSick).toBeVisible()
  await expect(employeeDashboardPage.balanceCasual).toBeVisible()

  // Get the balance values
  const annualBalance = await employeeDashboardPage.getBalance('Annual')
  const sickBalance = await employeeDashboardPage.getBalance('Sick')
  const casualBalance = await employeeDashboardPage.getBalance('Casual')

  // Verify balances contain expected values (or at least are not empty)
  expect(annualBalance).toBeTruthy()
  expect(sickBalance).toBeTruthy()
  expect(casualBalance).toBeTruthy()
})

// Data-driven test for Apply Leave
for (const leaveRequest of leavedata.leaveRequests) {
  test(`Apply Leave @smoke - ${leaveRequest.leaveType} from ${leaveRequest.startDate} to ${leaveRequest.endDate}`, async ({ page }) => {
    // Navigate to apply leave page
    await applyLeavePage.goto()

    // Fill and submit the form
    await applyLeavePage.fillAndSubmit(
      leaveRequest.leaveType,
      leaveRequest.startDate,
      leaveRequest.endDate,
      leaveRequest.reason
    )

    // Wait for success toast to appear
    await expect(applyLeavePage.toast).toBeVisible()

    // Navigate to leave history to confirm the request appears with Pending status
    await leaveHistoryPage.goto()

    // Verify the submitted leave request appears in history
    // The history table should contain the leave type and start date
    const historyTable = leaveHistoryPage.historyTable
    await expect(historyTable).toContainText(leaveRequest.leaveType)
    await expect(historyTable).toContainText(leaveRequest.startDate)

    // Verify the status is "Pending"
    const statuses = await leaveHistoryPage.getRowStatuses()
    expect(statuses).toContain('Pending')
  })
}

test('Cancel Leave @smoke - Pending request status updates to Cancelled', { tag: '@smoke' }, async ({ page }) => {
  // First, apply a leave request
  const leaveRequest = leavedata.leaveRequests[0]!
  await applyLeavePage.goto()
  await applyLeavePage.fillAndSubmit(
    leaveRequest.leaveType,
    leaveRequest.startDate,
    leaveRequest.endDate,
    leaveRequest.reason
  )

  // Wait for success toast
  await expect(applyLeavePage.toast).toBeVisible()

  // Navigate to leave history
  await leaveHistoryPage.goto()

  // Find the recently added request (first row should be the most recent)
  // Get the request ID from the first row and cancel it
  const tableRows = page.locator('table tbody tr')
  const rowCount = await tableRows.count()

  if (rowCount > 0) {
    // Get the first row (most recent request)
    const firstRow = tableRows.first()
    const statusBadge = firstRow.locator('[id^="status-"]')

    // Verify initial status is Pending
    await expect(statusBadge).toContainText('Pending')

    // Find the cancel button in the row (it has a data-testid pattern)
    const cancelBtnInRow = firstRow.locator('[id^="cancelBtn-"]')

    // Click cancel button
    await cancelBtnInRow.click()

    // Wait for success toast
    await expect(leaveHistoryPage.toast).toBeVisible()

    // Refresh the page to confirm status change
    await page.reload()

    // Verify the status changed to Cancelled
    const updatedStatusBadge = firstRow.locator('[id^="status-"]')
    await expect(updatedStatusBadge).toContainText('Cancelled')
  }
})

test('Leave History @regression - All requests visible and Cancel only on Pending rows', { tag: '@regression' }, async ({ page }) => {
  // Navigate to leave history
  await leaveHistoryPage.goto()

  // Verify history table is visible
  await expect(leaveHistoryPage.historyTable).toBeVisible()

  // Get all rows in the history table
  const tableRows = page.locator('table tbody tr')
  const rowCount = await tableRows.count()

  // Verify at least one row is visible
  expect(rowCount).toBeGreaterThan(0)

  // Iterate through each row and verify Cancel button is only on Pending rows
  for (let i = 0; i < rowCount; i++) {
    const row = tableRows.nth(i)
    const statusBadge = row.locator('[id^="status-"]')
    const status = await statusBadge.innerText()

    // Check if cancel button exists in this row
    const cancelBtn = row.locator('[id^="cancelBtn-"]')
    const cancelBtnExists = await cancelBtn.isVisible().catch(() => false)

    // Cancel button should only exist for Pending requests
    if (status === 'Pending') {
      // Cancel button should be visible for Pending
      expect(cancelBtnExists).toBe(true)
    } else {
      // Cancel button should not be visible for non-Pending
      expect(cancelBtnExists).toBe(false)
    }
  }
})
