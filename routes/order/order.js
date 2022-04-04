const express=require("express")
const crypto=require("crypto")
const router=express.Router()
const {databaseEcommerce}=require("../.././index")
const {AuthToken,Validator}=require("../../middleware/middleware")
let orderModel=databaseEcommerce.createSchemaModel(require("./orderSchema"))
let {productModel}=require("../products/product")
let {ObjectId}=require("mongodb")
let axios=require("axios")


/**
 * Post request handler for order route
 * Validate user login and order information
 * Create random 10 char pin for orderId
 * Finds product and check for stock available
 * Adds 100 extra in price for delivery
 * Save order data in orders collection
 * If payment method = esewa sends json for request to esewa
 */
router.post("/",AuthToken.jwtAuthentication,Validator.validateOrder,async (req,res)=>{
    
    const orderID=crypto.randomBytes(10).toString("hex")
    try{
        let productData=await databaseEcommerce.findById(req.body.productId,{},productModel)

        if (productData.data[0].stock==0){
            res.status(401).json({"status":"faliure","message":"Product out of stock"})
            return
        }

        var totalAmount=productData.data[0].price + 100

        let orderData={
            orderId:orderID,
            productId:req.body.productId,
            username:req.user.username,
            address:req.body.address,
            contactNumber:req.body.contactNumber,
            price:totalAmount,
            paymentMethod:req.body.paymentMethod,
            pricePaid:0,
            paid:false
        }

        await databaseEcommerce.saveToModel(orderData,orderModel)
        databaseEcommerce.updateToModel({"_id":ObjectId(orderData.productId)},{$set:{stock:--productData.data[0].stock}},productModel)

        if (req.body.paymentMethod=="esewa") {
            res.json({redirect_url:"https://uat.esewa.com.np/epay/main",method:"POST",values:{
                tAmt:totalAmount,
                amt:productData.data[0].price,
                txAmt:0,
                psc:0,
                pdc:100,
                scd:"EPAYTEST",
                pid:orderID,
                su:"http://127.0.0.1:65000/order/esewa/success",
                fu:`http://127.0.0.1:65000/order/esewa/faliure?oid=${orderID}`
                }
            })
            return
        }
        else{
            res.json({"status":"Success","message":"Order placed"})
        }
    }
    catch(err){
        res.status(404).json({status:"Faliure",message:err})
    }
})



/**
 * Get request handler for callback from esewa
 * Fetch data using oid from request body
 * Verify payment using refid
 * If payment is invalid or altered by the user. order gets invalid
 * If payment is valid update order paid to true, paidAmount to amount paid by user
 */
router.get("/esewa/success",async (req,res)=>{
    try{
        let orderData=await databaseEcommerce.fetchDatabase({"orderId":req.query.oid},{},orderModel)
        var path="https://uat.esewa.com.np/epay/transrec";
        var params={
            amt: orderData.data[0].price,
            rid: req.query.refId,
            pid: req.query.oid,
            scd: "EPAYTEST"
        }

        var validate= await axios.get(path,{params})

        if(validate.data!="<response>\n<response_code>\nSuccess\n</response_code>\n</response>\n") {
            databaseEcommerce.updateToModel({"orderId":req.query.oid},{"$set":{"invalidTransaction":true,"pricePaid":req.query.amt,"refId":req.query.refId}},orderModel)
            databaseEcommerce.updateToModel({"_id":ObjectId(orderData.data[0].productId)},{$inc:{stock:1}},productModel)
            res.status(400).json({"status":"failure",message:"No transaction or imsufficient amount transferred Please try again"})
            return
        }
        if(orderData.data[0].paid){
            res.status(400).json({"status":"failure","message":"Payment already placed"})
            return
        }
        await databaseEcommerce.updateToModel({"orderId":req.query.oid},{"$set":{"paid":true,"pricePaid":req.query.amt,"refId":req.query.refId}},orderModel)
        res.json({"status":"success","message":"Payment placed successfully"})
    
    }
    catch(err){
        console.log(err)
        res.status(400).json({status:"Failure",message:"Order id doesn't exists"})
    }
})



/**
 * Get request for failed callback from esewa payment
 * Checks for the oid of order
 * Delete order and increase stock of product related
 */
router.get("/esewa/faliure",async (req,res)=>{
    try{
        let orderData=await databaseEcommerce.fetchDatabase({"orderId":req.query.oid},{},orderModel)
        await databaseEcommerce.deleteFromModel({"orderId":orderData.data[0].orderId},orderModel)
        databaseEcommerce.updateToModel({"_id":ObjectId(orderData.data[0].productId)},{$inc:{stock:1}},productModel)
    }
    catch(err){
        res.status(404).json(err)
    }
})

router.get("/user-order",AuthToken.jwtAuthentication,async (req,res)=>{
    console.log(req.user.username)
    try{
        let orderData=await databaseEcommerce.fetchDatabase({"username":req.user.username},{},orderModel)
        res.json({status:"success",message:orderData.data})
    }
    catch(err){
        res.status(400).json({status:"failure",message:err})
    }
})

module.exports={
    router
}