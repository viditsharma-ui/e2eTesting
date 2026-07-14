import { test, expect } from '@playwright/test'
import { LeaveLoginPage } from '../pages/LeaveLoginPage.js'
import leavedata from '../testdata/leavedata.json' with { type: 'json' }

const employeeEmail = leavedata.employee.email
const employeePassword = leavedata.employee.password
const managerEmail = leavedata.manager.email
const managerPassword = leavedata.manager.password
const invalidEmail = 'invalid@test.com'
const invalidPassword = 'InvalidPassword123'

let leaveLoginPage: LeaveLoginPage

test.beforeEach(async ({ page }) => {
  leaveLoginPage = new LeaveLoginPage(page)
  await leaveLoginPage.goto()
})

test('Login with valid employee credentials', { tag: '@smoke' }, async ({ page }) => {
  await leaveLoginPage.login(employeeEmail, employeePassword)
  // Wait for navigation to employee dashboard
  await page.waitForURL('**/employee/dashboard')
  await expect(page).toHaveURL(/.*employee\/dashboard/)
})

test('Login with valid manager credentials', { tag: '@smoke' }, async ({ page }) => {
  await leaveLoginPage.login(managerEmail, managerPassword)
  // Wait for navigation to manager dashboard
  await page.waitForURL('**/manager/dashboard')
  await expect(page).toHaveURL(/.*manager\/dashboard/)
})

test('Login with invalid credentials', { tag: '@regression' }, async () => {
  await leaveLoginPage.login(invalidEmail, invalidPassword)
  // Expect error toast to be visible
  await expect(leaveLoginPage.toast).toBeVisible()
  await expect(leaveLoginPage.toast).toContainText('Incorrect')
})

test('Empty email shows inline error', { tag: '@regression' }, async () => {
  await leaveLoginPage.login('', employeePassword)
  // Expect email error message to be visible
  await expect(leaveLoginPage.emailError).toBeVisible()
})

test('Empty password shows inline error', { tag: '@regression' }, async () => {
  await leaveLoginPage.login(employeeEmail, '')
  // Expect password error message to be visible
  await expect(leaveLoginPage.passwordError).toBeVisible()
})

test('Logout redirects to login', { tag: '@smoke' }, async ({ page }) => {
  // Login first as employee
  await leaveLoginPage.login(employeeEmail, employeePassword)
  // Wait for navigation to dashboard
  await page.waitForURL('**/employee/dashboard')

  // Perform logout
  await leaveLoginPage.logout()

  // Expect to be on login page
  await expect(page).toHaveURL(/.*login/)
})

test('Unauthenticated access redirects to login', { tag: '@regression' }, async ({ page }) => {
  // Try to access protected route without logging in
  await page.goto('/employee/dashboard')

  // Expect redirect to login page
  await expect(page).toHaveURL(/.*login/)
})
