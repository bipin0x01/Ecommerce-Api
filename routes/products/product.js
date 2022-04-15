const express=require("express")
const router=express.Router()
const path=require("path")
const {databaseEcommerce}=require("../.././index")
const { AuthToken,Validator } = require("../../middleware/middleware")

let productModel= databaseEcommerce.createSchemaModel(require("./productSchema"))



/** 
 * Multer module to parse multipart/form-data
*/
const multer=require("multer")



/**
 * Setting storage engiene
*/
const storage=multer.diskStorage({
    destination:"./public/images/products",
    filename:(req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname))
    },
    
})



/**
 * Setting multar storage and file filter
*/
const upload=multer({
    limits:{fileSize:1024*1024*50},
    storage,
    fileFilter:(req,file,cb)=>{
        const filetype=/.jpg|.png|.jpeg|.gif/
        let ValidFileExt=filetype.test(path.extname(file.originalname))
        let ValidMimeType=filetype.test(file.mimetype)
        if(ValidFileExt && ValidMimeType){
            cb(null,true)
        }
        else{
            cb("Error: Image invalid")
        }
    }
}).array("images",5)

function multerMiddleWare(req,res,next){
    upload(req,res,(err)=>{
        if (err){
            res.json({"status":"failure","message":err})
        }
        else{
            next()
        }
    })
}

/**
 * Get request handler for / path 
 * Sends product data interm of category min-max price as responce
 */
router.get("/",async (req,res)=>{
    let{category,minprice,maxprice}=req.query
    if (category==undefined && minprice==undefined && maxprice==undefined){
        try{
            let productData=await databaseEcommerce.fetchDatabase({},{},productModel)
            res.status(200).json({"status":"suc1ess","data":productData.data})
            return
        }
        catch(err){
            res.json({"status":"error","message":err.data})
            return
        }
    }

    if(category && maxprice && minprice){
        try{
            let productData=await databaseEcommerce.fetchDatabase({category:category.toLowerCase(),price:{"$gt":Number(minprice),"$lt":Number(maxprice)}},{},productModel)
            res.status(200).json({"status":"sucess","data":productData.data})
            return
        }
        catch(err){
            res.status(404).json({"status":"error","message":"No product of this category"})
        }
    }

    if(category){
        try{
            let productData=await databaseEcommerce.fetchDatabase({category:category.toLowerCase()},{},productModel)
            res.status(200).json({"status":"sucess","data":productData.data})
            return
        }
        catch(err){
            res.status(404).json({"status":"error","message":"No product of this category"})
        }
    }

    if(minprice && maxprice){
        try{
            let productData=await databaseEcommerce.fetchDatabase({price:{"$gt":Number(minprice),"$lt":Number(maxprice)}},{},productModel)
            res.status(200).json({"status":"sucess","data":productData.data})
            return
        }
        catch(err){
            res.status(404).json({"status":"error","message":"No product of this category"})
        }
    }
})



/**
 * Get request for single-product path
 * Sends matched id product information 
 */
router.get("/single-product",async (req,res)=>{
    try{
        let productData=await databaseEcommerce.findById(req.query._id,{},productModel)
        res.json({"status":"success",message:productData.data[0]})
    }
    catch(err){
        res.status(400).json({"status":"failure",message:"No product found"})
    }
})




/**
 * Get request handler for / path 
 * Sends data that matches the id param
*/
router.get("/search/:id",async (req,res)=>{
    try{
        let productData=await databaseEcommerce.fetchDatabase({productName:{"$regex":`${req.params.id}`}},{},productModel)
        res.status(200).json({"status":"sucess","data":productData.data})
    } 
    catch(err){
        res.status(404).json({"status":"error","message":"No product of this Name"})
    }
})


/**
 * Get request handler for all-category
 * Sends category of product
 */
router.get("/all-category",async(req,res)=>{
    try{
        let productData=await databaseEcommerce.fetchDatabase({},{_id:0,category:1},productModel)
        let category=productData.data.map(item =>{
            return (item.category!=undefined)?item.category:null
        })
        res.status(200).json({"status":"sucess","data":category})
    }
    catch(err){
        res.status(404).json({"status":"error","message":"No products available"})
    }
})


/**
 * Post request handler for /add path
 * Verify if the user is admin or not
 * Validate the product information
 * Adds to the database
 */
router.post("/add",AuthToken.jwtAuthentication,multerMiddleWare,Validator.validateProduct,async (req,res,next)=>{
    if(req.user.role!="admin" || req.user.role==undefined){
        res.status(204).json({"status":"failure","message":"Only accessed from admin"})
    }
    try{
        await databaseEcommerce.saveToModel(req.product,productModel)
        res.status(200).json({"status":"Succes","message":"Product added to database"})
    }
    catch(err){
        res.status(503).json({"status":"error","message":"Error occured try again"})
    }
})




module.exports={
    router,
    productModel
}