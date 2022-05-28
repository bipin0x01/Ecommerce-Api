const { databaseEcommerce } = require("../../index");
let staffsAccountModel = databaseEcommerce.createSchemaModel(
  require("./staffsAccountSchema")
); //staff Paid record
let shopAccountModel = databaseEcommerce.createSchemaModel(
  require("./shopAccountSchema")
); //Shop recived money record

module.exports = {
  staffsAccountModel,
  shopAccountModel,
};
