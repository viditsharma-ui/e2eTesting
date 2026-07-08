// Hooks  - A special method which perform a setup and tear down process

// test.beforeAll(){...} - It will be executed before running any of the test cases. - db connection
// test.beforeEach(){...} - It will run before running each and every test case. - Pre-condition/ Common steps inside each test
// test()
// test.afterEach(){...} - It will run after running each and every test case. - close the browser
// test.afterAll(){...} - It will be executed after execution of all the test cases. - close db connection

import {test} from '@playwright/test'


test.beforeEach(async ()=>{
    console.log("Before Each");
})

test.afterEach(async ()=>{
    console.log("After Each");
})

test.afterAll(async ()=>{
    console.log("After All");
})

test("Test1", async ()=>{
    console.log("Test1")
})

test("Test2", async ()=>{
    console.log("Test2")
})

test("Test3", async ()=>{
    console.log("Test3")
})

test.beforeAll(async ()=>{
    console.log("Before All");
})