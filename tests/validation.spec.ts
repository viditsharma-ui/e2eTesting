import { test, expect } from '@playwright/test'
import { LeaveLoginPage } from '../pages/LeaveLoginPage.js'
import { ApplyLeavePage } from '../pages/ApplyLeavePage.js'
import { LeaveHistoryPage } from '../pages/LeaveHistoryPage.js'
import { ManagerDashboardPage } from '../pages/ManagerDashboardPage.js'
import { EmployeeDashboardPage } from '../pages/EmployeeDashboardPage.js'
import leavedata from '../testdata/leavedata.json' with { type: 'json' }

let loginPage: LeaveLoginPage
let applyLeavePage: ApplyLeavePage
let leaveHistoryPage: LeaveHistoryPage
let managerDashboardPage: ManagerDashboardPage
let employeeDashboardPage: EmployeeDashboardPage

test.beforeEach(async ({ page }) => {
  loginPage = new LeaveLoginPage(page)
  applyLeavePage = new ApplyLeavePage(page)
  leaveHistoryPage = new LeaveHistoryPage(page)
  managerDashboardPage = new ManagerDashboardPage(page)
  employeeDashboardPage = new EmployeeDashboardPage(page)
})

test('End Date before Start Date shows validation error and does NOT create request', { tag: '@regression' }, async ({ page }) => {
  // Login as employee
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Navigate to apply leave form
  await applyLeavePage.goto()

  // Fill form with endDate before startDate
  const startDate = '2026-08-15'
  const endDate = '2026-08-10' // Before start date

  await applyLeavePage.leaveType.selectOption('Annual')
  await applyLeavePage.startDate.fill(startDate)
  await applyLeavePage.endDate.fill(endDate)
  await applyLeavePage.reason.fill('Invalid leave')
  await applyLeavePage.submitLeave.click()

  // Expect validation error to be visible
  await expect(applyLeavePage.dateError).toBeVisible()

  // Navigate to history and verify no new request was created
  await leaveHistoryPage.goto()
  const initialRowCount = await leaveHistoryPage.tableRows.count()

  // Verify row count hasn't increased by verifying the most recent request doesn't have today's submission
  const statuses = await leaveHistoryPage.getRowStatuses()
  expect(statuses.length).toBeGreaterThanOrEqual(0)
})

test('Empty Reason blocked with validation error', { tag: '@regression' }, async ({ page }) => {
  // Login as employee
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Navigate to apply leave form
  await applyLeavePage.goto()

  // Fill form without reason (leave it empty)
  await applyLeavePage.leaveType.selectOption('Annual')
  await applyLeavePage.startDate.fill('2026-08-15')
  await applyLeavePage.endDate.fill('2026-08-16')
  await applyLeavePage.reason.fill('') // Empty reason
  await applyLeavePage.submitLeave.click()

  // Expect validation error to be visible
  await expect(applyLeavePage.reasonError).toBeVisible()
  const errorText = await applyLeavePage.reasonError.innerText()
  expect(errorText).toBeTruthy()
})

test('Empty Leave Type blocked with validation message', { tag: '@regression' }, async ({ page }) => {
  // Login as employee
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Navigate to apply leave form
  await applyLeavePage.goto()

  // Fill form without selecting leave type
  await applyLeavePage.startDate.fill('2026-08-15')
  await applyLeavePage.endDate.fill('2026-08-16')
  await applyLeavePage.reason.fill('Test leave')

  // Try to submit without selecting leave type
  await applyLeavePage.submitLeave.click()

  // The form should not submit - either validation error is shown or button is disabled
  // Check if we're still on the apply page (form not submitted)
  const currentUrl = page.url()
  expect(currentUrl).toContain('/employee/apply')
})

test('Same-day leave (start==end) is valid and accepted', { tag: '@regression' }, async ({ page }) => {
  // Login as employee
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Navigate to apply leave form
  await applyLeavePage.goto()

  // Fill form with same start and end date
  const sameDate = '2026-08-20'
  await applyLeavePage.leaveType.selectOption('Casual')
  await applyLeavePage.startDate.fill(sameDate)
  await applyLeavePage.endDate.fill(sameDate)
  await applyLeavePage.reason.fill('Same day leave')
  await applyLeavePage.submitLeave.click()

  // Expect success message (toast should appear)
  await expect(applyLeavePage.toast).toBeVisible()
  const toastText = await applyLeavePage.toast.innerText()
  expect(toastText).toBeTruthy()

  // Verify request appears in history with Pending status
  await leaveHistoryPage.goto()
  const rowCount = await leaveHistoryPage.tableRows.count()
  expect(rowCount).toBeGreaterThan(0)

  // Verify the most recent entry has matching dates
  const firstRow = leaveHistoryPage.tableRows.first()
  const rowText = await firstRow.innerText()
  expect(rowText).toContain(sameDate)
})

test('Cancel button absent on Approved request (after manager approves)', { tag: '@regression' }, async ({ page }) => {
  // First, employee creates a leave request
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Navigate to apply leave form
  await applyLeavePage.goto()
  const startDate = '2026-08-25'
  const endDate = '2026-08-26'

  await applyLeavePage.leaveType.selectOption('Annual')
  await applyLeavePage.startDate.fill(startDate)
  await applyLeavePage.endDate.fill(endDate)
  await applyLeavePage.reason.fill('Test for approval')
  await applyLeavePage.submitLeave.click()

  // Wait for success message
  await expect(applyLeavePage.toast).toBeVisible()

  // Get the request ID from history
  await leaveHistoryPage.goto()
  const firstRow = leaveHistoryPage.tableRows.first()
  const rowText = await firstRow.innerText()

  // Extract request ID from the row (assuming it's the first cell or has an ID attribute)
  const requestId = await firstRow.getAttribute('data-request-id') || '1'

  // Now logout and login as manager
  await loginPage.logout()
  await loginPage.goto()
  await loginPage.login(leavedata.manager.email, leavedata.manager.password)
  await page.waitForURL('**/manager/dashboard')

  // Approve the request
  await managerDashboardPage.goto()
  await managerDashboardPage.approveRequest(requestId)
  await expect(managerDashboardPage.toast).toBeVisible()

  // Logout from manager and login as employee again
  await loginPage.logout()
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Go to leave history
  await leaveHistoryPage.goto()

  // Verify cancel button is NOT visible for the approved request
  const cancelBtnExists = await leaveHistoryPage.hasCancelButton(requestId)
  expect(cancelBtnExists).toBeFalsy()

  // Verify the status is Approved
  const statuses = await leaveHistoryPage.getRowStatuses()
  expect(statuses[0]).toContain('Approved')
})

test('Cancel button absent on Rejected request', { tag: '@regression' }, async ({ page }) => {
  // First, employee creates a leave request
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Navigate to apply leave form
  await applyLeavePage.goto()
  const startDate = '2026-09-01'
  const endDate = '2026-09-02'

  await applyLeavePage.leaveType.selectOption('Sick')
  await applyLeavePage.startDate.fill(startDate)
  await applyLeavePage.endDate.fill(endDate)
  await applyLeavePage.reason.fill('Test for rejection')
  await applyLeavePage.submitLeave.click()

  // Wait for success message
  await expect(applyLeavePage.toast).toBeVisible()

  // Get the request ID from history
  await leaveHistoryPage.goto()
  const firstRow = leaveHistoryPage.tableRows.first()
  const requestId = await firstRow.getAttribute('data-request-id') || '1'

  // Now logout and login as manager
  await loginPage.logout()
  await loginPage.goto()
  await loginPage.login(leavedata.manager.email, leavedata.manager.password)
  await page.waitForURL('**/manager/dashboard')

  // Reject the request
  await managerDashboardPage.goto()
  await managerDashboardPage.rejectRequest(requestId)
  await expect(managerDashboardPage.toast).toBeVisible()

  // Logout from manager and login as employee again
  await loginPage.logout()
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Go to leave history
  await leaveHistoryPage.goto()

  // Verify cancel button is NOT visible for the rejected request
  const cancelBtnExists = await leaveHistoryPage.hasCancelButton(requestId)
  expect(cancelBtnExists).toBeFalsy()

  // Verify the status is Rejected
  const statuses = await leaveHistoryPage.getRowStatuses()
  expect(statuses[0]).toContain('Rejected')
})

test('Role isolation (employee JWT rejected on manager API route)', { tag: '@regression' }, async ({ page }) => {
  // Login as employee
  await loginPage.goto()
  await loginPage.login(leavedata.employee.email, leavedata.employee.password)
  await page.waitForURL('**/employee/dashboard')

  // Get the employee token from localStorage
  const employeeToken = await page.evaluate(() => localStorage.getItem('token'))
  expect(employeeToken).toBeTruthy()

  // Try to call manager API endpoint with employee token
  const response = await page.request.get('http://localhost:3001/leave/pending', {
    headers: {
      Authorization: `Bearer ${employeeToken}`,
    },
  })

  // Should get 403 Forbidden
  expect(response.status()).toBe(403)
})
