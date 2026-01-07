const express = require("express");

const router = express.Router();

// importing middleware
const authMiddleware = require("../middlewares/auth.middleware")

// route for creating chat
router.post("/",authMiddleware)

module.exports= router
