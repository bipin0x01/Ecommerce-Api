const express=require("express")
const router=express.Router()
const {databaseEcommerce}=require("../.././index")

const { AuthToken } = require("../../middleware/middleware")
let staffModel= databaseEcommerce.createSchemaModel(require("./staffSchema"))

module.exports={
    staffModel,
    router
}

/**
 * Middleware to handle all authentication
 */
router.use("/auth",require("./../auth/staffAuth").router)


router.get("/dashboard",AuthToken.jwtAuthentication,async (req,res)=>{
    try{
        let userData=await databaseEcommerce.fetchDatabase({"username":req.user.username},{password:0,username:0},staffModel)
        res.json({"status":"success",message:userData.data[0]})
    }
    catch(err){
        res.json({"status":"failure","message":err})
    }
})