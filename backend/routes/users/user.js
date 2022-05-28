const express = require("express");
const router = express.Router();
const { databaseEcommerce } = require("../.././index");
const bcrypt = require("bcrypt");
const { AuthToken } = require("../../middleware/middleware");

let userModel = databaseEcommerce.createSchemaModel(require("./userSchema"));
module.exports = {
  userModel,
};

/**
 * Middleware to handle all authentication for user
 * Include google oauth2
 */
router.use("/auth", require("../auth/userAuth"));

router.get("/dashboard", AuthToken.jwtAuthentication, async (req, res) => {
  console.log(req.user.username);
  try {
    let userData = await databaseEcommerce.fetchDatabase(
      { username: req.user.username },
      { password: 0, username: 0 },
      userModel
    );
    res.json({ status: "success", message: userData.data[0] });
  } catch (err) {
    res.json({ status: "failure", message: err.data });
  }
});

module.exports = {
  router,
};
