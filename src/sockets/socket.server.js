const { Server } = require("socket.io");
const authenticateSocket = require("./middlewares/auth.socket");
const { generateResponse, generateVectors } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

// socket server
const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    /* options */
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    socket.on("ai-message", async (data) => {
      // store user message
      const message = await messageModel.create({
        chat: data.chat,
        user: socket.user._id,
        content: data.content,
        role: "user",
      });

      // generate vectors
      const vectors = await generateVectors(data.content);

      // query memory
      const memory = await queryMemory({
        quaryVector: vectors,
        limit: 5,
        metadata: {
          userId: socket.user._id,
        },
      });

      // create memory
      await createMemory({
        vector: vectors,
        messageId: message._id,
        metadata: {
          chatId: data.chat,
          userId: socket.user._id,
          message: data.content,
        },
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
      const aiMessage = await messageModel.create({
        chat: data.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      // generate response vectors
      const responseVectors = await generateVectors(response);

      // create response memory
      await createMemory({
        vector: responseVectors,
        messageId: aiMessage._id,
        metadata: {
          chatId: data.chat,
          userId: socket.user._id,
          message: response,
        },
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
