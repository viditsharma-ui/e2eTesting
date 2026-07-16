import{test,expect} from "@playwright/test"
import { Login } from "../Login/Login.js"
import { Dashboard } from "../Login/Dashboard.js"
import {Cart} from "../Login/Cart.js"

let productName="zara coat 3"
let email= "vidit.sharma2606@gmail.com"
let password = "Vidit@1234"
let successToastMessage= " Product Added To Cart "
const url= "https://rahulshettyacademy.com/client/#/auth/login"



let loginPage:Login
let dashboardPage:Dashboard
let cart:Cart
test.beforeEach(async({page})=>{
    loginPage= new Login(page)
    dashboardPage= new Dashboard(page)
    cart= new Cart(page)
    await loginPage.loginUrl(url)
    await loginPage.inputLogin(email,password)
    await expect(loginPage.homePageIdentifer).toBeVisible()
    await dashboardPage.addProductToCart(productName)
    await expect(dashboardPage.orderConfirmationMessage).toHaveText(successToastMessage)
})

test("view cart",async({})=>{
    await dashboardPage.cartButton.click()
    await expect(cart.productName.first()).toBeVisible()
    await expect(cart.productName.first()).toContainText(productName, {ignoreCase: true})
})