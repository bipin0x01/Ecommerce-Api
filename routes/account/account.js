const {databaseEcommerce}=require("../../index")
let staffsAccountModel= databaseEcommerce.createSchemaModel(require("./staffsAccountSchema"))
let shopAccountModel=databaseEcommerce.createSchemaModel(require("./shopAccountSchema"))

module.exports={
    staffsAccountModel,
    shopAccountModel
}