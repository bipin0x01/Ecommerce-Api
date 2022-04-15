const collectionName="delivery"
const deliverySchema={
    deliveryBoy:String,
    orderId:String,
    customersName:String,
    address:String,
    phoneNumber:String,
    deliveryDate:Date,
    deliveryStatus:{type:String,default:"pending"},
    price:Number,
}

module.exports={
        collectionName:collectionName,
        schemaModel:deliverySchema
}