import {test,expect } from '@playwright/test'
import { Login } from '../Login/Login.js'
import { Dashboard } from '../Login/Dashboard.js'

// import {test, expect} from '@playwright/test'
// import { DashboardPage } from '../pages/DashboardPage'
// import { LoginPage } from '../pages/LoginPage'

// // launch the url - object for lp

// // Launch the url, loginIntoApplication - object of lp, dp

// const url = "https://rahulshettyacademy.com/client"
// let email = "testnHNk@gmail.com"
// let password = "Testing@1234"
// let productName = "ADIDAS ORIGINAL"

// let lp:LoginPage
// let dp:DashboardPage
// test.beforeEach(async ({page})=>{
//     lp = new LoginPage(page)
//     dp = new DashboardPage(page)
//     await lp.launchURL(url)
//     await lp.loginIntoApplication(email, password)
//     await expect(lp.homePageIdentifer).toBeVisible()
// })

// test("Search and add the product to the cart", {tag:'@smoke'},async ()=>{
//     await dp.searchProduct(productName, 1)
//     await expect(dp.addToCartMessage).toHaveText("Product Added To Cart")
// })


// test("Search and view product details", {tag: ['@smoke', '@regression']}, async ()=>{
//     await dp.searchProduct(productName, 0)
//     await expect(dp.viewPageProductName).toHaveText(productName)
//     await expect(dp.viewPageProductPrice).toHaveText(dp.homePageProductPrice)
// })

// npx playwright test --last-failed



// 1. Object - {name: "Rahul"}
// 2. JSON - DD using Json
// 3. Excel - DD
// 4. .env - qa.env, prod.env
// 5. Allure
// 6. Jenkins

// 7. MCP - AI
// 8. Playwright Agent 
// 9. API test case - Playwright

let productName="zara coat 3"
let email= "vidit.sharma2606@gmail.com"
let password = "Vidit@1234"
let successToastMessage= " Product Added To Cart "
const url= "https://rahulshettyacademy.com/client/#/auth/login"


let loginPage:Login
let dashboardPage:Dashboard
test.beforeEach(async({page})=>{
    loginPage= new Login(page)
    dashboardPage= new Dashboard(page)
    await loginPage.loginUrl(url)
    await loginPage.inputLogin(email,password)
    await expect(loginPage.homePageIdentifer).toBeVisible()
})

test("Add to Cart",async({})=>{
    await dashboardPage.addProductToCart(productName)
    await expect(dashboardPage.orderConfirmationMessage).toHaveText(successToastMessage)
})

test("Product View", async({})=>{

})


