import {test, expect} from '@playwright/test'
import { Login } from '../Login/Login.js'
import data from '../testdata/testdata.json' with {type: 'json'}


let lp:Login
test.beforeEach(async ({page})=>{
   lp = new Login(page)
   await lp.loginUrl(data.url)
})

test("Test login with correct credentials", {tag:['@smoke', '@regression']}, async ()=>{
    await lp.inputLogin(data.email, data.password)
    await expect(lp.homePageIdentifer).toBeVisible()
})

test("Test login with incorrect credentials", {tag:'@regression'}, async ()=>{
    await lp.inputLogin(data.email, data.invalidPassword)
    await expect(lp.errorMessage).toHaveText(data.errorMessage)
})

// Hooks in Playwright