require("dotenv").config();
const path = require("path");
const express = require("express");
const router = express.Router();
const { databaseEcommerce } = require("../../index");
const jwt = require("jsonwebtoken");
const axios = require("axios");
let userModel = require("../users/user").userModel;
const querystring = require("querystring");
const { Validator, AuthToken } = require("../../middleware/middleware");
const bcrypt = require("bcrypt");
const saltRound = 10;
const fs = require("fs");

/**
 * Multer module to parse multipart/form-data
 */
const multer = require("multer");

/**
 * Setting storage engiene
 */
const storage = multer.diskStorage({
  destination: "./public/images/users",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

/**
 * Setting multar storage and file filter
 */
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetype = /.jpg|.png|.jpeg|.gif/;
    let ValidFileExt = filetype.test(path.extname(file.originalname));
    let ValidMimeType = filetype.test(file.mimetype);
    if (ValidFileExt && ValidMimeType) {
      cb(null, true);
    } else {
      cb("Error: Image invalid");
    }
  },
}).single("avatar");

/**
 * Middleware to handle err while getting file content
 */
function multerMiddleWare(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      res.json({ status: "failure", message: err });
    } else {
      next();
    }
  });
}

/**
 * Post request handler for register path
 * Checks if the format of data is correct
 * If the format is correct it hashes password and saves to database
 */
router.post(
  "/register",
  multerMiddleWare,
  Validator.validateUserData,
  async (req, res) => {
    try {
      userData = await databaseEcommerce.findOrCreate(
        { username: req.userData.username },
        req.userData,
        {},
        userModel
      );
      if (userData.msg == "User Found") {
        fs.unlink(
          path.join("./public/images/users", req.file.filename),
          (err) => {}
        );
        res.status(401).json({ message: "User Exists" });
        return;
      } else if (userData.msg == "User Created") {
        res.status(201).json({ success: "User Created" });
        return;
      }
    } catch (err) {
      res.status(503).json({ failure: "Error while creating user" });
    }
  }
);

/**
 * getToken(code) function takes 1 argument code and makes post request to oauth google api for access token
 */
function getToken(code) {
  return axios.post("https://oauth2.googleapis.com/token", {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code,
    redirect_uri: "http://localhost:65000/user/auth/google/config",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    grant_type: "authorization_code",
  });
}

/**
 * getProfile(access_token,id_token) function takes 2 argument access_token and id_token
   and makes get request to  google api for profile 
*/
function getProfile(access_token, id_token) {
  return axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  );
}

/**
 * get request handler  for path /google/config
 * Gets code from header and calls getToken for token
 * After getting token from getToken calls getProfile
 * After getting profile calls findOrCreate to create user if user exists makes jwt and sends response
 */
router.get("/google/config", async (req, res) => {
  try {
    let { data } = await getToken(req.query.code);
    let profile = await getProfile(data.access_token, data.id_token);
    let payload = {
      username: profile.data.id,
      email: profile.data.email,
      role: "user",
      profile: {
        fName: profile.data.given_name,
        lName: profile.data.family_name,
        avatar: profile.data.picture,
      },
    };

    let databaseHandlerReply = await databaseEcommerce.findOrCreate(
      { username: profile.data.id },
      payload,
      {},
      userModel
    );
    res.setHeader("Access-Control-Allow-Credentials", true)

    if (databaseHandlerReply.msg == "User Found") {
      const token = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN);
      res.cookie("refresh-token","Bearer "+token, {
        httpOnly: true,
        maxAge:10*12*30*24*60*60*60*1000,
        sameSite: false,
        path:"/",
        signed:false,
        secure: true,
      });
      res.redirect("http://localhost:3000")
      return
    }
    if (databaseHandlerReply.msg == "User Created") {
      const token = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN);
      res.cookie("refresh-token","Bearer "+token, {
        httpOnly: true,
        maxAge:10*12*30*24*60*60*60*1000,
        sameSite: false,
        path:"/",
        signed:false,
        secure: true,
      });
      res.json({ refreshToken: token });
      return
    }
  } catch (err) {
    res.status(403).json(err);
  }
});

/**
 * Get request handler for google login
 * redirect user to google oauth page
 */
router.get("/google", (req, res) => {
  const options = {
    redirect_uri: "http://localhost:65000/user/auth/google/config",
    client_id: process.env.CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  res.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" +
      querystring.stringify(options)
  );
});

/**
 * Post handler for /login
 * Checks if the username or password is undefined
 * Compares data to database if matched creates a jwt and sends to user
 */
router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username == undefined || password == undefined) {
    res
      .status(403)
      .json({ status: "error", message: "No username or password" });
    return;
  }
  try {
    userInformation = await databaseEcommerce.fetchDatabase(
      { username: username },
      {},
      userModel
    );
    if (bcrypt.compareSync(password, userInformation.data[0].password)) {
      let payload = {
        username: userInformation.data[0].username,
        email: userInformation.data[0].email,
        role: userInformation.data[0].role,
        profile: {
          fName: userInformation.data[0].profile.fName,
          lName: userInformation.data[0].profile.lName,
          avatar: userInformation.data[0].profile.avatar,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN);
      res.setHeader("Access-Control-Allow-Credentials", true)
      res.cookie("refresh-token","Bearer "+token, {
        httpOnly: true,
        maxAge:10*12*30*24*60*60*60*1000,
        sameSite: false,
        path:"/",
        signed:false,
        secure: true,
      });
      res.json({ refreshToken: token });
      return
      
    } else {
      res.status(403).json({ status: "error", message: "Password does not match" });
      return
    }
  } catch (error) {
    res.status(403).json({ status: "error", message: "Username not found" });
  }
});

router.get("/get-access-token",AuthToken.createUserAccessToken)

router.post("/available-username",async (req,res)=>{
  try{
    username=await databaseEcommerce.fetchDatabase({"username":req.body.username},{},userModel)
    return res.json({message:false})
  }
  catch(err){
    res.json({message:true})
  }
})

router.get("/user-logged-in",(req,res)=>{
  let token =
    req.cookies["refresh-token"] && req.cookies["refresh-token"].split(" ")[1];
  if (token == undefined) {
    res.status(401).json({ status: "error", message: "no refresh token found" });
    return;
  }
  jwt.verify(token, process.env.JWT_REFRESH_TOKEN, (err, userData) => {
    if (err) {
      res
        .status(403)
        .json({ status: "error", message: "jwt token was tempered" });
      return;
    } else {
      res.json({"status":"success",data:userData})
    }
  });
})

// router.get("/logout",)

module.exports = router;