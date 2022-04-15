const collectionName="order"
const orderSchema={
    orderId:{type:String,require:true},
    productId:[{type:String,require:true}],
    username:{type:String,require:true},
    address:{type:String,require:true},
    contactNumber:{type:String,require:true},
    price:{type:Number,require:true},
    orderdate:{type:Date,default:Date()},
    paymentMethod:{type:String,require:true},
    pricePaid:{type:Number,require:true},
    orderStatus:{type:String,default:"Warehouse"},
    paid:{type:Boolean,default:false},
    invalidTransaction:{type:Boolean,default:false},
    refId:{type:String,default:""}
}

module.exports={
    collectionName:collectionName,
    schemaModel:orderSchema
}