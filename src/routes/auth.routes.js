const express = require("express");

const router = express.Router();

// authMiddleware
const authMiddleware = require("../middlewares/auth.middleware");

// importing controllers
const {
  registerController,
  loginController,
  logOutController,
} = require("../controllers/auth.controllers");

// route for user register
router.post("/register", registerController);

// route for user login
router.post("/login", loginController);

// route for user logout
router.post("/logout",authMiddleware, logOutController);


module.exports = router;
