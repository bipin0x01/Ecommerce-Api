const collectionName="products"
const productSchema={
    productName:{type:String,require:true},
    desc:{type:String,require:true},
    category:{type:String,require:true},
    subCategory:{type:String},
    stock:{type:Number},
    price:{type:Number,require:true},
    images:{type:Array},
}

module.exports={
    collectionName:collectionName,
    schemaModel:productSchema
}