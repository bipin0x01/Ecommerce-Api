const express=require("express")
const router=express.Router()
const {databaseEcommerce}=require("../.././index")
const {AuthToken}=require("./../../middleware/middleware")
let deliveryModel= databaseEcommerce.createSchemaModel(require("./deliverySchema"))
let {staffModel}=require("./../staffs/staff")
let {orderModel}=require("./../order/order")
let {staffsAccountModel,shopAccountModel}=require("./../account/account")


/**
 * Get request handler for get-delivery path
 * Sends pending delivery data of delivery boy
 */
router.get("/get-delivery",AuthToken.jwtAuthentication,async (req,res)=>{

    try{
        if(req.user.role=="admin"){
            let deliveryData=await databaseEcommerce.fetchDatabase({deliveryStatus:"pending"},{},deliveryModel)
            res.json({"status":"success","message":deliveryData.data})
            return
        }
        else if(req.user.role=="delivery"){
            let deliveryData=await databaseEcommerce.fetchDatabase({deliveryBoy:req.user.username,deliveryStatus:"pending"},{},deliveryModel)
            res.json({"status":"success","message":deliveryData.data})
            return
        }
        else{
            res.json({"status":"failure","message":"Can only  be accessed by admin and delivery boy"})
        }
    }
    catch(err){
        res.json({"status":"faliure","message":err.data})
    }

})


/**
 * Post request handler for complete-delivery path
 * Checks for user  role is admin || delivery
 * update order as delivered and update user cashToPay
 */
router.post("/complete-delivery",AuthToken.jwtAuthentication,async (req,res)=>{
    if(req.user.role!=="admin" && req.user.role!=="delivery"){
        res.json({"status":"faliure","message":"only accessed by admin or deliery"})
        return
    }
    try{
        deliveryData=await databaseEcommerce.fetchDatabase({orderId:req.body.id},{deliveryStatus:1,deliveryBoy:1,price:1},deliveryModel)
        if(deliveryData.data[0].deliveryStatus!=="pending") {
            res.json({"status":"failure","message":"previous delivered order"})
            return
        }
        databaseEcommerce.updateToModel({orderId:req.body.id},{$set:{deliveryStatus:"delivered"}},deliveryModel)
        databaseEcommerce.updateToModel({orderId:req.body.id},{$set:{orderStatus:"delivered",pricePaid:deliveryData.data[0].price,paid:true}},orderModel)
        databaseEcommerce.updateToModel({username:req.user.username},{$inc:{cashCollected:deliveryData.data[0].price}},staffModel)
        res.json({"status":"success","message":"order completed please pay-cash to admin"})

    }
    catch(err){
        res.json({"status":"failure","message":err.data})
    }
})



/**
 * Post request handler for submit-cash
 * Delivery boy cashToPay decrease
 */
router.post("/submit-cash",AuthToken.jwtAuthentication,async(req,res)=>{
    if(req.user.role!="admin"){
        res.json({"status":"failure","message":"only access by admin"})
        return
    }
    let staffUsername=req.body.staffUsername
    let cashAmount=Number(req.body.amount)
    try{
        let userValid=await databaseEcommerce.fetchDatabase({username:staffUsername},{cashCollected:1},staffModel)
        if(userValid.data[0].cashAmount != cashAmount) return res.json({"status":"failure","message":"Amount not matched"})
        await databaseEcommerce.updateToModel({username:staffUsername},{$inc:{cashCollected:-cashAmount}},staffModel)
        databaseEcommerce.saveToModel({cashed:cashAmount},shopAccountModel)
        databaseEcommerce.saveToModel({staffName:staffUsername,cashed:cashAmount},staffsAccountModel)
    }
    catch(err){
        res.json({"status":"failure","message":err.data})
    }
})


module.exports={
    router,
    deliveryModel
}