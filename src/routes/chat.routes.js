const express = require("express");

const router = express.Router();

// importing middleware
const authMiddleware = require("../middlewares/auth.middleware");

// importing controllers
const {
  createChatController,
  getAllChatsController,
  getAllMessagesController,
} = require("../controllers/chat.controllers");

// route for creating chat
router.post("/", authMiddleware, createChatController);

// route for getting all chats of a user
router.get("/", authMiddleware, getAllChatsController);

router.get("/messages/:id", authMiddleware, getAllMessagesController);

module.exports = router;
