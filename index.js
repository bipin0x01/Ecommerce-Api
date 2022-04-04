require("dotenv").config()
const express=require("express")
const app=express()
const DatabaseMongo=require("./database")
const databaseEcommerce=new DatabaseMongo(process.env.DATABASE_LINK)
module.exports={databaseEcommerce}



/**
 * Middleware for bodyparser
 */
app.use(express.urlencoded({extended:true}))
app.use(express.json())



/**
 * Routes middleware for user, cart, product, order 
*/
app.use("/user",require("./routes/users/user").router)
app.use("/cart",require("./routes/cart/cart").router)
app.use("/products",require("./routes/products/product").router)
app.use("/order",require("./routes/order/order").router)



/**
 * Listening on 65000 port
 */
app.listen(process.env.PORT,()=>{
    console.log("Port Open in "+process.env.PORT)
})
