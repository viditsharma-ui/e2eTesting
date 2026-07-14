import { Page, Locator } from '@playwright/test'

export class LeaveLoginPage {
  page: Page
  email: Locator
  password: Locator
  loginBtn: Locator
  toast: Locator
  emailError: Locator
  passwordError: Locator

  constructor(page: Page) {
    this.page = page
    this.email = page.locator('#email')
    this.password = page.locator('#password')
    this.loginBtn = page.locator('#loginBtn')
    this.toast = page.locator('#toast-container')
    this.emailError = page.locator('#emailError')
    this.passwordError = page.locator('#passwordError')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.email.fill(email)
    await this.password.fill(password)
    await this.loginBtn.click()
  }

  async logout() {
    // Remove token and role from localStorage
    await this.page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    })
    // Navigate to login
    await this.page.goto('/login')
  }
}
