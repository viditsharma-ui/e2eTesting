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
        // Use text input fields by type since they're the primary form inputs
        this.firstName = page.locator('input[type="text"]').nth(0)
        this.lastName = page.locator('input[type="text"]').nth(1)
        this.postalCode = page.locator('input[type="text"]').nth(2)
        // Button with "Place Order" text or similar
        this.placeOrderButton = page.getByText('Place Order')
            .or(page.getByText('PLACE ORDER'))
            .first()
        // Order confirmation message - appears after form submission
        this.orderConfirmation = page.getByText(/thankyou|thank.*you|order.*confirm|order.*placed|success/i).first()
    }

    async fillCheckoutForm(firstName: string, lastName: string, postalCode: string) {
        await this.firstName.fill(firstName)
        await this.lastName.fill(lastName)
        await this.postalCode.fill(postalCode)
    }
}
