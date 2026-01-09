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
      const response = await generateResponse(data.content);

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
