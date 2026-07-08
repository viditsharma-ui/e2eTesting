

let data= [
   {
        "url": "https://rahulshettyacademy.com/client",
        "email" : "testnHNk@gmail.com",
        "password" : "Testing@1234",
        "productName": "ADIDAS ORIGINAL",
        "successMessage" : "Product Added To Cart"
    },
    {
        "url": "https://rahulshettyacademy.com/client",
        "email" : "testnHNk@gmail.com",
        "password" : "Testing@1234",
        "productName": "ZARA COAT 3",
        "successMessage" : "Product Added To Cart"
    },
    {
        "url": "https://rahulshettyacademy.com/client",
        "email" : "testnHNk@gmail.com",
        "password" : "Testing@1234",
        "productName": "iphone 13 pro",
        "successMessage" : "Product Added To Cart"
    },
    {
        "url": "https://rahulshettyacademy.com/client",
        "email" : "testnHNk@gmail.com",
        "password" : "Testing@1234",
        "productName": "Google Pixel 9",
        "successMessage" : "Product Added To Cart"
    },
    {
        "url": "https://rahulshettyacademy.com/client",
        "email" : "testnHNk@gmail.com",
        "password" : "Testing@1234",
        "productName": "Tshirt",
        "successMessage" : "Product Added To Cart"
    },
    {
        "url": "https://rahulshettyacademy.com/client",
        "email" : "testnHNk@gmail.com",
        "password" : "Testing@1234",
        "productName": "Jeans",
        "successMessage" : "Product Added To Cart"
    }
]

// console.log(data[5]?.productName)
for (let product of data){
    console.log(product.productName)
}