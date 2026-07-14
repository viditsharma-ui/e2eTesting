import { test, expect } from '@playwright/test'
import { LeaveLoginPage } from '../pages/LeaveLoginPage.js'
import { ManagerDashboardPage } from '../pages/ManagerDashboardPage.js'
import { ApplyLeavePage } from '../pages/ApplyLeavePage.js'
import leavedata from '../testdata/leavedata.json' with { type: 'json' }

const managerEmail = leavedata.manager.email
const managerPassword = leavedata.manager.password
const employeeEmail = leavedata.employee.email
const employeePassword = leavedata.employee.password

let leaveLoginPage: LeaveLoginPage
let managerDashboardPage: ManagerDashboardPage
let applyLeavePage: ApplyLeavePage
let leaveRequestId: string | null = null

test.beforeAll(async ({ browser }) => {
  // Create a new page for employee login and leave request submission
  const page = await browser.newPage()
  leaveLoginPage = new LeaveLoginPage(page)
  applyLeavePage = new ApplyLeavePage(page)

  // Login as employee
  await leaveLoginPage.goto()
  await leaveLoginPage.login(employeeEmail, employeePassword)
  await page.waitForURL('**/employee/dashboard')

  // Apply a leave request
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

  // Extract request ID from pending table (will be used in tests)
  // For now, we store a flag that a request was created
  leaveRequestId = 'leave-request-created'

  await page.close()
})

test.beforeEach(async ({ page }) => {
  leaveLoginPage = new LeaveLoginPage(page)
  managerDashboardPage = new ManagerDashboardPage(page)

  // Login as manager
  await leaveLoginPage.goto()
  await leaveLoginPage.login(managerEmail, managerPassword)
  // Wait for navigation to manager dashboard
  await page.waitForURL('**/manager/dashboard')
})

test('Manager Dashboard @smoke - pending requests visible', { tag: '@smoke' }, async () => {
  // Navigate to manager dashboard (already logged in from beforeEach)
  await managerDashboardPage.goto()

  // Verify pending requests table is visible
  await expect(managerDashboardPage.pendingTable).toBeVisible()

  // Verify that there is at least one pending request (the one created in beforeAll)
  const pendingCount = await managerDashboardPage.getPendingCount()
  expect(pendingCount).toBeGreaterThan(0)
})

test('Manager Approve @smoke - approve request, disappears from queue', { tag: '@smoke' }, async ({ page }) => {
  // Navigate to manager dashboard (already logged in from beforeEach)
  await managerDashboardPage.goto()

  // Get initial count of pending requests
  const initialCount = await managerDashboardPage.getPendingCount()
  expect(initialCount).toBeGreaterThan(0)

  // Get the first request ID from the table
  // The first row should contain the request we created in beforeAll
  const firstRow = page.locator('#pending-requests-table tbody tr').first()
  await expect(firstRow).toBeVisible()

  // Extract the request ID from the first row
  // Assuming the approve button has a data-testid like 'approve-btn-<id>'
  const approveBtn = firstRow.locator('[data-testid^="approve-btn-"]')
  const testId = await approveBtn.getAttribute('data-testid')
  const requestId = testId ? testId.replace('approve-btn-', '') : 'unknown'

  // Click approve button
  await approveBtn.click()

  // Wait for success toast
  await expect(managerDashboardPage.toast).toBeVisible()

  // Verify the pending count decreased by 1
  await page.reload()
  const updatedCount = await managerDashboardPage.getPendingCount()
  expect(updatedCount).toBe(initialCount - 1)
})

test('Manager Reject @smoke - reject request, disappears from queue', { tag: '@smoke' }, async ({ browser }) => {
  // Need to create a fresh request to reject (since the previous test approved the first one)
  // Create a new browser context for employee setup
  const employeePage = await browser.newPage()
  const empLeaveLoginPage = new LeaveLoginPage(employeePage)
  const empApplyLeavePage = new ApplyLeavePage(employeePage)

  // Login as employee and create another leave request
  await empLeaveLoginPage.goto()
  await empLeaveLoginPage.login(employeeEmail, employeePassword)
  await employeePage.waitForURL('**/employee/dashboard')

  // Apply a different leave request (use a different index to vary the data)
  const leaveRequest = leavedata.leaveRequests[1]!
  await empApplyLeavePage.goto()
  await empApplyLeavePage.fillAndSubmit(
    leaveRequest.leaveType,
    leaveRequest.startDate,
    leaveRequest.endDate,
    leaveRequest.reason
  )

  // Wait for success toast
  await expect(empApplyLeavePage.toast).toBeVisible()

  await employeePage.close()

  // Now login as manager using the existing page context
  const managerPage = await browser.newPage()
  const mgLeaveLoginPage = new LeaveLoginPage(managerPage)
  const mgManagerDashboardPage = new ManagerDashboardPage(managerPage)

  await mgLeaveLoginPage.goto()
  await mgLeaveLoginPage.login(managerEmail, managerPassword)
  await managerPage.waitForURL('**/manager/dashboard')

  // Navigate to manager dashboard
  await mgManagerDashboardPage.goto()

  // Get initial count of pending requests
  const initialCount = await mgManagerDashboardPage.getPendingCount()
  expect(initialCount).toBeGreaterThan(0)

  // Get the first request ID from the table
  const firstRow = managerPage.locator('#pending-requests-table tbody tr').first()
  await expect(firstRow).toBeVisible()

  // Extract the request ID from the first row and click reject button
  const rejectBtn = firstRow.locator('[data-testid^="reject-btn-"]')
  const testId = await rejectBtn.getAttribute('data-testid')
  const requestId = testId ? testId.replace('reject-btn-', '') : 'unknown'

  // Click reject button
  await rejectBtn.click()

  // Wait for success toast
  await expect(mgManagerDashboardPage.toast).toBeVisible()

  // Verify the pending count decreased by 1
  await managerPage.reload()
  const updatedCount = await mgManagerDashboardPage.getPendingCount()
  expect(updatedCount).toBe(initialCount - 1)

  await managerPage.close()
})
