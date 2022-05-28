const express = require("express");
const router = express.Router();
const path = require("path");
const { databaseEcommerce } = require("../.././index");
const { AuthToken, Validator } = require("../../middleware/middleware");

let productModel = databaseEcommerce.createSchemaModel(
  require("./productSchema")
);

/**
 * Multer module to parse multipart/form-data
 */
const multer = require("multer");
const { parse } = require("path");

/**
 * Setting storage engiene
 */
const storage = multer.diskStorage({
  destination: "./public/images/products",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

/**
 * Setting multar storage and file filter
 */
const upload = multer({
  limits: { fileSize: 1024 * 1024 * 50 },
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
}).array("images", 5);

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
 * Get request handler for / path
 * Sends product data interm of category min-max price as responce
 */
router.get("/", async (req, res) => {
  let { category, minprice, maxprice, page , limit, subcategory } = req.query;


  startIndex=(page && limit)?(parseInt(page)-1)*limit:0
  endIndex=(page && limit)?(parseInt(page))*limit:0


  if (category == undefined && minprice == undefined && maxprice == undefined && subcategory==undefined) {
    try {
      let queryLength=await databaseEcommerce.paginationSearchLength({},
        {},
        productModel
      )

      let productData = await databaseEcommerce.paginationSearch(
        {},
        {},
        productModel
      ,startIndex,limit
    );

      let result={}
      result.products=productData.data
      if (endIndex < queryLength) result.next={page:parseInt(page)+1,limit:limit}
      res.status(200).json({ status: "success", data: result});
      return;

    } catch (err) {
      console.log(err.message)
      res.json({ status: "error", message: err.data });
      return;
    }
  }

  if ( ( category || subcategory ) && ( maxprice || minprice ) ) {
    try {
      projection={}

      if (category) projection.category=category.toLowerCase()
      else projection.subCategory=subcategory.toLowerCase()

      
      if (minprice) projection.price={ $gt: Number(minprice)}
      else projection.price={ $lt: Number(maxprice) }

      if (minprice && maxprice) { 
        projection.price={ $gt: Number(minprice), $lt: Number(maxprice) } 
      }

      if (category && subcategory) { 
        projection.category=category.toLowerCase()
        projection.subCategory=subcategory.toLowerCase()
      }


      let queryLength = await databaseEcommerce.paginationSearchLength(
        projection,
        {},
        productModel
      );

      let productData = await databaseEcommerce.paginationSearch(
        projection,
        {},
        productModel
      ,startIndex,limit);
    
      let result={}
      result.products=productData.data
      if (endIndex < queryLength) result.next={page:parseInt(page)+1,limit:limit}
      res.status(200).json({ status: "sucess", data: result});

      return;

    } catch (err) {
      res
        .json({ status: "error", message: err.data });
      return 
    }
  }

  if (category || subcategory) {
    try {
      projection={}
      if (category && subcategory) { 
        projection.category=category.toLowerCase()
        projection.subCategory=subcategory.toLowerCase()
      }
      if (category) projection.category=category.toLowerCase()
      else projection.subCategory=subcategory.toLowerCase()



      let queryLength = await databaseEcommerce.paginationSearchLength(
        projection,
        {},
        productModel
      );

      let productData = await databaseEcommerce.paginationSearch(
        projection,
        {},
        productModel
      ,startIndex,limit);
      
      let result={}
      console.log(queryLength,endIndex)
      result.products=productData.data
      console.log(queryLength,endIndex)
      if (endIndex < queryLength) result.next={page:parseInt(page)+1,limit:limit}
      res.status(200).json({ status: "success", data: result});
      return;

    } catch (err) {
      res
        .json({ status: "error ", message: err.data });
      return
    }
  }

  if (minprice || maxprice) {
    try {
      projection={}
      if (minprice && maxprice) { 
        projection.price={ $gt: Number(minprice), $lt: Number(maxprice) } 
      }

      if (minprice) projection.price={ $gt: Number(minprice)}
      else projection.price={ $lt: Number(maxprice) }
      
      let queryLength = await databaseEcommerce.paginationSearchLength(
        projection,
        {},
        productModel
      );

      let productData = await databaseEcommerce.paginationSearch(
        projection,
        {},
        productModel
      ,startIndex,limit);
      
      let result={}
      result.products=productData.data
      console.log(queryLength,endIndex)
      if (endIndex < queryLength) result.next={page:parseInt(page)+1,limit:limit}
      res.status(200).json({ status: "success", data: result});
      return;

    } catch (err) {
      console.log(err.message)
      res
        .json({ status: "error", message: err.data });
    }
  }
});

/**
 * Get request for single-product path
 * Sends matched id product information
 */
router.get("/single-product", async (req, res) => {
  try {
    let productData = await databaseEcommerce.findById(
      req.query._id,
      {},
      productModel
    );
    res.json({ status: "success", message: productData.data[0] });
  } catch (err) {
    res.json({ status: "failure", message: "No product found" });
  }
});

/**
 * Get request handler for / path
 * Sends data that matches the id param
 */
router.get("/search/:id", async (req, res) => {
  try {
    let productData = await databaseEcommerce.fetchDatabase(
      { productName: { $regex: `${req.params.id}` } },
      {},
      productModel
    );
    res.status(200).json({ status: "sucess", data: productData.data });
  } catch (err) {
    res
      .json({ status: "error", message: "No product of this Name" });
  }
});

/**
 * Get request handler for all-category
 * Sends category of product
 */
router.get("/all-category", async (req, res) => {
  try {
    let productData = await databaseEcommerce.fetchDatabase(
      {},
      { _id: 0, category: 1 },
      productModel
    );
    let category = productData.data.map((item) => {
      return item.category != undefined ? item.category : null;
    });
    res.status(200).json({ status: "sucess", data: category });
  } catch (err) {
    res.json({ status: "error", message: "No products available" });
  }
});

/**
 * Post request handler for /add path
 * Verify if the user is admin or not
 * Validate the product information
 * Adds to the database
 */
router.post(
  "/add",
  AuthToken.jwtAuthentication,
  multerMiddleWare,
  Validator.validateProduct,
  async (req, res, next) => {
    if (req.user.role != "admin" || req.user.role == undefined) {
      res
        .status(204)
        .json({ status: "failure", message: "Only accessed from admin" });
    }
    try {
      await databaseEcommerce.saveToModel(req.product, productModel);
      res
        .status(200)
        .json({ status: "Succes", message: "Product added to database" });
    } catch (err) {
      res
        .status(503)
        .json({ status: "error", message: "Error occured try again" });
    }
  }
);

module.exports = {
  router,
  productModel,
};
