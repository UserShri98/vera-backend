const { Server } = require("socket.io");
const authenticateSocket = require("./middlewares/auth.socket");
const generateResponse = require("../services/ai.service");
const messageModel = require("../models/message.model");

// socket server
const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    /* options */
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    socket.on("ai-message", async (data) => {
      const vectors = await generateVectors(data.content);
      // store user message
      await messageModel.create({
        chat: data.chat,
        user: socket.user._id,
        content: data.content,
        role: "user",
      });

      // fetch chat history
      const chatHistory = (
        await messageModel
          .find({
            chat: data.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

      // generate AI response
      const response = await generateResponse(
        chatHistory.map((msg) => {
          return {
            role: msg.role,
            parts: [{ text: msg.content }],
          };
        })
      );

      // store ai response
      await messageModel.create({
        chat: data.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      socket.emit("ai-response", {
        chat: data.chat,
        content: response,
      });
    });
    socket.on("disconnect", () => {
      console.log("Socket Server disconnected");
    });
  });
};

module.exports = initSocketServer;
