const collectionName="carts"
const productSchema={
    cartNumber:{type:Number},
    cartProducts:{type:String}
}

module.exports={
    collectionName:collectionName,
    Schema:productSchema
}