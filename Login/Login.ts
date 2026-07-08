import {Page,Locator} from '@playwright/test'
import { url } from 'node:inspector'

// Locators and methods related to Login Page

// import { Locator, Page } from "@playwright/test";

// export class LoginPage{

//     // Locators  - Properties

//     page: Page
//     private email :Locator 
//     private password: Locator
//     private loginBtn: Locator
//     errorMessage : Locator
//     homePageIdentifer : Locator

//     constructor(page:Page){
//         this.page = page 
//         this.email = this.page.getByPlaceholder("email@example.com") 
//         this.password = this.page.getByPlaceholder("enter your passsword")
//         this.loginBtn = this.page.locator("#login")
//         this.errorMessage = this.page.locator("#toast-container")
//         this.homePageIdentifer = this.page.locator("[routerlink='/dashboard/']")
//     }

//     // Methods

//     async launchURL(url:string){
//         await this.page.goto(url)
//     }

//     async loginIntoApplication(username:string, passsword: string){
//         await this.email.fill(username)
//         await this.password.fill(passsword)
//         await this.loginBtn.click()
//     }

// }

export class Login{

    page:Page
    email: Locator
    password: Locator
    loginButton:Locator
    errorMessage:Locator
    successMessage: Locator
    emailErrorMessage: Locator
    passwordErrorMessage:Locator
    homePageIdentifer:Locator
    

    constructor(page:Page){
        this.page = page
        this.email= page.locator("#userEmail")
        this.password= page.locator("#userPassword")
        this.loginButton= page.locator("#login")
        this.errorMessage= page.locator("#toast-container")
        this.successMessage= page.locator("#toast-container")
        this.emailErrorMessage= page.getByText("*Email is required")
        this.passwordErrorMessage= page.getByText("*Password is required")
        this.homePageIdentifer = page.locator("[routerlink='/dashboard/']")

    }

    async loginUrl(url:string){
        await this.page.goto(url)
    }

    async inputLogin(email:string, password:string){
        await this.email.fill(email)
        await this.password.fill(password)
        await this.loginButton.click()
    }
}

