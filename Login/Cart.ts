import{ test,Locator} from "@playwright/test"

export class Cart{

    page:Page
    productName: Locator
    productPrice:Locator
    checkoutButton:Locator

    constructor(page: Page){
        this.page = page
        this.productName= page.locator("div.cartSection h3")
        this.productPrice= page.locator("div.cartSection h3+div")
        this.checkoutButton= page.getByText("Checkout")
    }

}