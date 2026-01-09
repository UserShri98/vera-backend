const { Server } = require("socket.io");

// socket server

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    /* options */
  });

  io.on("connection", (socket) => {
    console.log("Socket Server connected");
    socket.on("disconnect", () => {
      console.log("Socket Server disconnected");
    });
  });
};

module.exports = initSocketServer;
