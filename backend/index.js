require("dotenv").config();
const express = require("express");
const app = express();
const cors=require("cors")
const DatabaseMongo = require("./database");
const databaseEcommerce = new DatabaseMongo(process.env.DATABASE_LINK);
const cookieParser = require('cookie-parser');
const bodyParser=require("body-parser")
module.exports = { databaseEcommerce };

/**
 * Middleware for bodyparser
 */
 app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static("./public"));


/**
 * Middle ware for cors and cookie
 */
app.use(cors({origin:["http://localhost:3000","http://192.168.56.1:3000","http://localhost:5500"],credentials:true}))
app.use(cookieParser());

/**
 * Routes middleware for user, cart, product, order
 */
app.use("/user", require("./routes/users/user").router);
app.use("/cart", require("./routes/cart/cart").router);
app.use("/product", require("./routes/products/product").router);
app.use("/order", require("./routes/order/order").router);
app.use("/staff", require("./routes/staffs/staff").router);
app.use("/delivery", require("./routes/delivery/delivery").router);

/**
 * Listening on 65000 port
 */
app.listen(process.env.PORT, () => {
  console.log("Port Open in " + process.env.PORT);
});
