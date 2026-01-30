const { Server } = require("socket.io");
const authenticateSocket = require("./middlewares/auth.socket");
const { generateResponse, generateVectors } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

// socket server
const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors:{
      origin:process.env.VITE_FRONTEND_URL,
      credentials:true
    }
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("Socket Server connected:");
    socket.on("ai-message", async (data) => {

      // store user message and generate vectors concurrently
      const [message, vectors] = await Promise.all([
        await messageModel.create({
          chat: data.chat,
          user: socket.user._id,
          content: data.content,
          role: "user",
        }),

        generateVectors(data.content),
      ]);

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

      // query memory and fetch chat history concurrently
      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          quaryVector: vectors,
          limit: 5,
          metadata: {
            userId: socket.user._id,
          },
        }),

        messageModel
          .find({
            chat: data.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
      ]);
      chatHistory.reverse();

      // short term memory
      const stm = chatHistory.map((msg) => {
        return {
          role: msg.role,
          parts: [{ text: msg.content }],
        };
      });

      // long term memory
      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `This is relevant context from previous conversations:
                ${memory.map((m) => m.metadata.message).join(" \n ")}`,
            },
          ],
        },
      ];

      // generate AI response
      const response = await generateResponse([...ltm, ...stm]);

      // emit AI response
      socket.emit("ai-response", {
        chat: data.chat,
        content: response,
      });

      // store ai response and generate response vectors concurrently
      const [aiMessage, responseVectors] = await Promise.all([
        messageModel.create({
          chat: data.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        }),

        generateVectors(response),
      ]);

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
    });

    socket.on("disconnect", () => {
      console.log("Socket Server disconnected");
    });
  });
};

module.exports = initSocketServer;
