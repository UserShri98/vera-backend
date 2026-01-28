const express = require("express");

const router = express.Router();

// importing middleware
const authMiddleware = require("../middlewares/auth.middleware");

// importing controllers
const {
  createChatController,
  getAllChatsController,
} = require("../controllers/chat.controllers");

// route for creating chat
router.post("/", authMiddleware, createChatController);

// route for getting all chats of a user
router.get("/:id", authMiddleware, getAllChatsController);

module.exports = router;
