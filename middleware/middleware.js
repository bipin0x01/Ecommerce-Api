require("dotenv").config()
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const saltRound=10
const fs=require("fs")
const path=require("path")

/**
 * Object for Authenticate access token
 */
let AuthToken=Object.create(null)



/**
 * Object for validating user input
 */
let Validator=Object.create(null)



/**
 * Authenticate request access token
 * Sends 401 if token in not available
 * Sends 403 if token is invalid
 * calls next middle ware and adds user data to req object
 */
AuthToken.jwtAuthentication=(req,res,next)=>{
    let token=req.headers["authorization"] && req.headers["authorization"].split(" ")[1]
    if(token==undefined){
        res.status(401).json({"status":"error","message":"no jwt found"})
        return
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,userData)=>{

        if (err){
            res.status(403).json({"status":"error","message":"jwt token was tempered"})
            return
        }
        else{
            req.user=userData
            next()
        }
    })
}



/**
 * method to validate information for registering user 
 * If not valid deletes the images of user and sends responce
 */
Validator.validateUserData=(req,res,next)=>{
    try{
        const re=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        var invalid=""
        if(req.body.username==undefined || req.body.username.indexOf(" ")!=-1 || req.body.username<6) invalid+="Username should be more then 6 character long with no white space.\n"
        if (req.body.password==undefined || req.body.password.length<7) invalid+="Password must be >=7 character long\n"
        if(req.body.email==undefined || !re.test(req.body.email.toLowerCase())) invalid+="Invalid Email\n"
        if(!req.body.fname) invalid+="No First Name Entered\n"
        if(!req.body.lname) invalid+="No Last Name Entered\n"
        if (invalid!=""){
            if(req.file.filename!=undefined) fs.unlink(path.join("./public/images/users",req.file.filename),(err)=>{
            })
            res.status(401).json({"status":"Faild","message":invalid})
            return   
        }
        const hashPassword=bcrypt.hashSync(req.body.password,saltRound)
        let data={
            username:req.body.username,
            password:hashPassword,
            email:req.body.email,
            role:"user",
            profile:{
                fName:req.body.fname,
                lName:req.body.lname,
                avatar:(req.file.filename==undefined)?"":req.file.filename
            }
        }
        req.userData=data
        next()
    }
    catch(err){
        res.json({"status":"failure","message":"multipart/form-data required"})
    }
}


/**
 * method to validate information for registering Staffs 
 * If not valid deletes the images of staffs and sends responce
 */
 Validator.validateStaffsData=(req,res,next)=>{

        const re=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        var invalid=""
        if(req.body.username==undefined || req.body.username.indexOf(" ")!=-1 || req.body.username<6) invalid+="Username should be more then 6 character long with no white space.\n"
        if (req.body.password==undefined || req.body.password.length<7) invalid+="Password must be >=7 character long\n"
        if(req.body.email==undefined || !re.test(req.body.email.toLowerCase())) invalid+="Invalid Email\n"
        if(req.body.address==undefined || !re.test(req.body.email.toLowerCase())) invalid+="Invalid address\n"
        if(req.body.contactNumber==undefined || !/\+977 \d\d\d\d\d\d\d\d\d\d/.test(req.body.contactNumber)) invalid+="Not valid phone number.\n"
        if(!req.body.fname) invalid+="No First Name Entered\n"
        if(!req.body.lname) invalid+="No Last Name Entered\n"
        if (req.file==undefined || req.file.filename==undefined) invalid+="No image included.\n"
        if (invalid!=""){
            if(req.file.filename!=undefined) fs.unlink(path.join("./public/images/staffs",req.file.filename),(err)=>{})
            res.status(401).json({"status":"Faild","message":invalid})
            return   
        }
        const hashPassword=bcrypt.hashSync(req.body.password,saltRound)
        let data={
            username:req.body.username,
            password:hashPassword,
            email:req.body.email,
            profile:{
                fName:req.body.fname,
                lName:req.body.lname,
                avatar:(req.file.filename==undefined)?"":req.file.filename
            }
        }
        req.userData=data
        next()
}




/**
 * method to validate to validate added product
 * If not valid deletes the images of product and sends responce
 */
Validator.validateProduct=(req,res,next)=>{
    if(req.user.role!="admin") {
        res.status(403).json({"status":"error","message":"Only access by admin"})
        return
    }
    var invalid=""
    if (req.body.productName==undefined) invalid+="No product name.\n"
    if (req.body.productDescription==undefined) invalid+="No product Description.\n"
    if (req.body.category==undefined) invalid+="No Category included.\n"
    if (req.body.stock==undefined) invalid+="No stock included.\n"
    if (req.body.price==undefined) invalid+="No price included.\n"
    if (req.files[0]==undefined) invalid+="No image included.\n"
    if (invalid!=""){
        if(req.files[0]!=undefined){
            req.files.forEach(item=>{
                fs.unlink(path.join("./public/images/products",item.filename),(err)=>{})
            })
        } 
        res.status(401).json({"status":"Faild","message":invalid})
        return
    }
    else{
        let images=req.files.map(item=>{
            return item.filename
        })
        req.product={
            productName:req.body.productName.toLowerCase(),
            desc:req.body.productDescription,
            category:req.body.category.toLowerCase(),
            subCategory:(req.body.subCategory!=undefined)?req.body.subCategory.toLowerCase():"",
            stock:Number(req.body.stock),
            price:Number(req.body.price),
            images:images
        }
        next()
    }
}



/**
 * method to validate to validate order
 */
Validator.validateOrder=(req,res,next)=>{
    var invalid=""
    if(req.body.productId==undefined) invalid+="No product id added.\n" 
    if(req.body.address==undefined) invalid+="No address added.\n"
    if(req.body.contactNumber==undefined || !/\+977 \d\d\d\d\d\d\d\d\d\d/.test(req.body.contactNumber)) invalid+="Not valid phone number.\n"
    if(req.body.paymentMethod==undefined) invalid+="Not valid payment method"

    if(invalid!=""){
        res.status(404).json({"status":"error","message":invalid})
        return
    }
    else{
        next()
    }

}


module.exports={AuthToken,Validator}