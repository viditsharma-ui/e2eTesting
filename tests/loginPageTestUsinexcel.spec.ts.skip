import {test, expect} from '@playwright/test'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { ExcelUtils } from '../utils/ExcelUtils'
import path from 'path'

const filePath = path.join(__dirname, "../testdata/excel.xlsx")
console.log(__dirname);

const sheetName = "Login"

let datas:any
try{
    datas = ExcelUtils.getExcelData(filePath, sheetName)
}
catch(e){
    console.log(e);
    
}

let lp:LoginPage
let dp:DashboardPage

test.beforeEach(async ({page})=>{
    lp = new LoginPage(page)
    dp = new DashboardPage(page)
    
})

// parameterization of the test case

for(let product of datas){

    test(`Search and add the product to the cart for ${product.productName}`, {tag:'@smoke'},async ()=>{
        await lp.launchURL(product.url)
        await lp.loginIntoApplication(product.username, product.password)
        await expect(lp.homePageIdentifer).toBeVisible()
        await dp.searchProduct(product.productName, 1)
        await expect(dp.addToCartMessage).toHaveText(product.cartSuccessMsg)
    })
}
