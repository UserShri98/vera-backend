const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

const createChatController = async (req, res) => {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title: title,
  });

  res.status(201).json({
    status: "Chat created successfully",
    chat: chat,
  });
};

const getAllChatsController = async (req, res) => {
  const user = req.user;

  const chats = await chatModel.find({ user: user._id });

  res.status(200).json({
    status: "Chats fetched successfully",
    chats: chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    })),
  });
};

const getAllMessagesController= async(req,res)=>{
  const chatId = req.params.id;

  const messages = await messageModel.find({chat:chatId}).sort({createdAt:1});

  res.status(200).json({
    status: "Messages fetched successfully",
    messages: messages,
  })
}

module.exports = {
  createChatController,
  getAllChatsController,
  getAllMessagesController
};
