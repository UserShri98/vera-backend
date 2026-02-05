const { Server } = require("socket.io");
const authenticateSocket = require("./middlewares/auth.socket");
const { generateResponse, generateVectors } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

let ioInstance = null;

const initSocketServer = (httpServer) => {
  // 🔥 Prevent multiple Socket.IO instances
  if (ioInstance) {
    console.log("⚠️ Socket server already initialized");
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.VITE_FRONTEND_URL,
      credentials: true,
    },
  });

  ioInstance.use(authenticateSocket);

  ioInstance.on("connection", (socket) => {
    console.log("✅ Socket Server connected:", socket.id);

    // 🔥 Remove old listeners if any
    socket.removeAllListeners("ai-message");

    socket.on("ai-message", async (data) => {
      try {
        console.log("🧠 AI MESSAGE RECEIVED:", socket.id);

        // store user message + embeddings
        const [message, vectors] = await Promise.all([
          messageModel.create({
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

        // query memory + chat history
        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            quaryVector: vectors,
            limit: 5,
            metadata: { userId: socket.user._id },
          }),
          messageModel
            .find({ chat: data.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
        ]);

        chatHistory.reverse();

        const stm = chatHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `Relevant context from previous chats:\n${memory
                  .map((m) => m.metadata.message)
                  .join("\n")}`,
              },
            ],
          },
        ];

        const response = await generateResponse([...ltm, ...stm]);

        // 🔥 Emit ONLY ONCE
        socket.emit("ai-response", {
          chat: data.chat,
          content: response,
        });

        // store AI response
        const [aiMessage, responseVectors] = await Promise.all([
          messageModel.create({
            chat: data.chat,
            user: socket.user._id,
            content: response,
            role: "model",
          }),
          generateVectors(response),
        ]);

        await createMemory({
          vector: responseVectors,
          messageId: aiMessage._id,
          metadata: {
            chatId: data.chat,
            userId: socket.user._id,
            message: response,
          },
        });
      } catch (err) {
        console.error("AI SOCKET ERROR:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return ioInstance;
};

module.exports = initSocketServer;
