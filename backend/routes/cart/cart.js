const express=require("express")
const router=express.Router()
const {databaseEcommerce}=require("../.././index")
let cartModel= databaseEcommerce.createSchemaModel(require("./cartSchema"))


module.exports={
    router
}