import {test, expect} from '@playwright/test'
import { Dashboard } from '../Login/Dashboard.js'
import { Login } from '../Login/Login.js'
import productdata from '../testdata/productdata.json' with {type: 'json'}

// test("Test login with correct credentials", async ({page})=>{
// console.log(productdata[2]?.productName);

// })


let lp:Login
let dp:Dashboard

for(let product of productdata){
test.beforeEach(async ({page})=>{
    lp = new Login(page)
    dp = new Dashboard(page)
    await lp.loginUrl(product.url)
    await lp.inputLogin(product.email, product.password)
    await expect(lp.homePageIdentifer).toBeVisible()
})

// parameterization of the test case


    test(`Search and add the product to the cart for ${product.productName}`, {tag:'@smoke'},async ()=>{
    
    await dp.addProductToCart(product.productName)
    await expect(dp.orderConfirmationMessage).toHaveText(product.successMessage)
    })

    // test(`Search and view product details for ${product.productName}`, {tag: ['@smoke', '@regression']}, async ()=>{
    //     await dp.searchProduct(product.productName, 0)
    //     await expect(dp.viewPageProductName).toHaveText(product.productName)
    //     await expect(dp.viewPageProductPrice).toHaveText(dp.homePageProductPrice)
    // })

}