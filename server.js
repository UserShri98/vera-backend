require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/db/db")
const initSocketServer = require("./src/sockets/socket.server");

// Initialize Socket Server
const httpServer = require("http").createServer(app);
initSocketServer(httpServer);

const port = process.env.PORT;

// DB connection
connectToDB();

httpServer.listen(port, () => {
  console.log("Server is running on port");
});
