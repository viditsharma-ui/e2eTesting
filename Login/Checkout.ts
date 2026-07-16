import {Page, Locator} from '@playwright/test'

export class Checkout {

    page: Page
    firstName: Locator
    lastName: Locator
    postalCode: Locator
    placeOrderButton: Locator
    orderConfirmation: Locator

    constructor(page: Page) {
        this.page = page
        this.firstName = page.locator('#firstName')
        this.lastName = page.locator('#lastName')
        this.postalCode = page.locator('#postalCode')
        this.placeOrderButton = page.getByText('Place Order')
        this.orderConfirmation = page.getByText('Thankyou for the order')
    }

    async fillCheckoutForm(firstName: string, lastName: string, postalCode: string) {
        await this.firstName.fill(firstName)
        await this.lastName.fill(lastName)
        await this.postalCode.fill(postalCode)
    }
}
