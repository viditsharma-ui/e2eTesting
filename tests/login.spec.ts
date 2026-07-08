import {test,expect } from '@playwright/test'
import { Login } from '../Login/Login.js'  
import{defineConfig} from '@playwright/test'

// import {test, expect} from '@playwright/test'
// import { LoginPage } from '../pages/LoginPage'

// const url = "https://rahulshettyacademy.com/client"
// let email = "testnHNk@gmail.com"
// let password = "Testing@1234"
// let invalidPassword = "Testing"
// let errorMessage = "Incorrect email or password."

// let lp:LoginPage
// test.beforeEach(async ({page})=>{
//    lp = new LoginPage(page)
//    await lp.launchURL(url)
// })

// test("Test login with correct credentials", async ()=>{
//     await lp.loginIntoApplication(email, password)
//     await expect(lp.homePageIdentifer).toBeVisible()
// })

// test("Test login with incorrect credentials", async ()=>{
//     await lp.loginIntoApplication(email, invalidPassword)
//     await expect(lp.errorMessage).toHaveText(errorMessage)
// })

// Hooks in Playwright

let email= "vidit.sharma2606@gmail.com"
let password = "Vidit@1234"
// let emptyPassword= " "
let invalidEmail= "vidit.sharma26@gmail.com"
let invalidPassword = "Vidi@12345"
let emailErrorMsg= "*Email is required"
let passwordErrorMsg= "*Password is required"
let toastErrorMessage = " Incorrect email or password. "
let toastSuccessMessage = " Login Successfully "
const url= "https://rahulshettyacademy.com/client/#/auth/login"

let loginPage:Login
test.beforeEach(async({page})=>{
    loginPage= new Login(page)
    await loginPage.loginUrl(url)
})

test("Login with valid creds ",{tag: "@smoke"}, async({page})=>{
     await loginPage.inputLogin(email,password)
     await expect(loginPage.successMessage).toHaveText(toastSuccessMessage)
     await page.waitForTimeout(3000)
})
test ("Login with invalid creds",{tag: "@regression"},async({page})=>{
    await loginPage.inputLogin(invalidEmail,invalidPassword)
    await expect(loginPage.errorMessage).toHaveText(toastErrorMessage)
})

test("Email Error Messages during Login",{tag: "@regression"}, async({page})=>{
    await loginPage.inputLogin(" ",password)
    await expect(loginPage.emailErrorMessage).toHaveText(emailErrorMsg)
})

test("Password Error Messages during Login",{tag: ["@regression","@smoke"]}, async({page})=>{
    await loginPage.inputLogin(email,"")
    await expect(loginPage.passwordErrorMessage).toHaveText(passwordErrorMsg)
})


































// let productname= "Sauce Labs Fleece Jacket"
// let firstName = "Vidit"
// let lastName= "Sharma"
// let postalCode = "201301"

// test ("Login Flow", async({page})=>{
//     await page.goto("https://www.saucedemo.com/")
//     await page .locator("#user-name").fill("standard_user")
//     await page .locator("#password").fill("secret_sauce")
//     await page.locator("#login-button").click()
//     await expect(page.getByText("Swag Labs")).toBeVisible()
//     // await page.getByText("Sauce Labs Fleece Jacket",{exact:true})

//     const products= await page.locator(".inventory_item_description")
//     await products.count()

//     await products.filter({hasText:`${productname}`}).locator("#add-to-cart-sauce-labs-fleece-jacket").click()
//     await page.locator(".shopping_cart_link").click()
//     await expect(page.locator("#checkout")).toBeVisible()
//     await page.locator("#checkout").click()
//     await expect(page.getByText("Checkout: Your Information")).toBeVisible()

//     await page.locator("#first-name").fill(firstName)
//     await page.locator("#last-name").fill(lastName)
//     await page.locator("#postal-code").fill(postalCode)
//     await page.locator("#continue").click()

//     await expect(page.getByText("Payment Information:")).toBeVisible()
//     await page.locator("#finish").click()
//     await expect(page.locator(".complete-header")).toBeVisible()
//     await page.waitForTimeout(5000)

// })