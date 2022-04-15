const express=require("express")
const crypto=require("crypto")
const router=express.Router()
const {databaseEcommerce}=require("../.././index")
const {AuthToken,Validator}=require("../../middleware/middleware")
let orderModel=databaseEcommerce.createSchemaModel(require("./orderSchema"))

module.exports={
    orderModel,
    router
}

let {productModel}=require("../products/product")
let {staffModel}= require("./../staffs/staff")
let {deliveryModel}=require("./../delivery/delivery")
let {shopAccountModel}=require("./../account/account")
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
        let productData=[]
        for (let i=0; i< req.body.productId.length;i++){
            let data=await databaseEcommerce.findById(req.body.productId[i],{price:1,stock:1},productModel)
            productData.push(data.data)
        }
        let outOfSock=""
        productData.forEach(product=>{
            if (product[0].stock<1){
                outOfSock+=`Product out of stock ${product[0]._id}\n`
            }
        })
        if(!outOfSock==""){
            res.status(400).json({status:"failure",message:outOfSock})
            return
        }

        var totalAmount=100
        productData.forEach(product=>{
            totalAmount+=product[0].price
        })

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

        let deliveryData={
            deliveryBoy:"",
            orderId:orderID,
            customersName:req.user.profile.fName +" "+ req.user.profile.lName,
            address:req.body.address,
            phoneNumber:req.body.contactNumber,
            price:totalAmount,
        }
        await databaseEcommerce.saveToModel(orderData,orderModel)
        req.body.productId.forEach(productId=>{
            updateProductStock(productId,{$inc:{stock:-1}})
        })
        setDeliery(deliveryData)
        

        if (req.body.paymentMethod=="esewa") {
            res.json({redirect_url:"https://uat.esewa.com.np/epay/main",method:"POST",values:{
                tAmt:totalAmount,
                amt:totalAmount-100,
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

let updateProductStock=async function updateProductStock(pid,query){
    databaseEcommerce.updateToModel({"_id":ObjectId(pid)},query,productModel).catch(err=>{})
}


/**
 * Function for setting delivery of order
 */
let setDeliery=async function setDelivery(deliveryObj){
    try{
        let staffData=await databaseEcommerce.fetchDatabase({role:"delivery"},{username:1,cashCollected:1},staffModel)
        let userData=staffData.data[0]
        staffData.data.forEach(data=>{
            if (data.price < userData.price) userData=data
        })
        deliveryObj.deliveryBoy=userData.username
        databaseEcommerce.saveToModel(deliveryObj,deliveryModel)
    }
    catch(err){
        console.log(err)
    }
    
}

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
            databaseEcommerce.deleteFromModel({"orderId":req.query.oid},deliveryModel)
            databaseEcommerce.updateToModel({"orderId":req.query.oid},{"$set":{"invalidTransaction":true,"pricePaid":req.query.amt,"refId":req.query.refId}},orderModel)
            orderData.data[0].productId.forEach(productId=>{
                updateProductStock(productId,{$inc:{stock:1}})
            })
            res.status(400).json({"status":"failure",message:"No transaction or imsufficient amount transferred Please try again"})
            return
        }
        if(orderData.data[0].paid){
            res.status(400).json({"status":"failure","message":"Payment already placed"})
            return
        }
        databaseEcommerce.updateToModel({"orderId":req.query.oid},{"$set":{"paid":true,"pricePaid":req.query.amt,"refId":req.query.refId}},orderModel)
        databaseEcommerce.updateToModel({"orderId":req.query.oid},{"$set":{price:0}},deliveryModel)
        databaseEcommerce.saveToModel({"orderId":req.query.oid,cashed:req.query.amt},shopAccountModel)
        res.json({"status":"success","message":"Payment placed successfully"})
    
    }
    catch(err){
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
        orderData.data[0].productId.forEach(productId=>{
            updateProductStock(productId,{$inc:{stock:1}})
        })
        databaseEcommerce.deleteFromModel({"orderId":req.query.oid},deliveryModel)
        databaseEcommerce.updateToModel({"_id":ObjectId(orderData.data[0].productId)},{$inc:{stock:1}},productModel)
    }
    catch(err){
        res.status(404).json(err)
    }
})


/**
 * Get request handler for user-order
 * Validate jwt
 * Sends order data to user
 */

router.get("/user-order",AuthToken.jwtAuthentication,async (req,res)=>{
    console.log(req.user.role)
    try{
        let orderData=await databaseEcommerce.fetchDatabase({"username":req.user.username},{},orderModel)
        res.json({status:"success",message:orderData.data})
    }
    catch(err){
        res.status(400).json({status:"failure",message:err})
    }
})

