const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// importing routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

// creating a server
const app = express();

// Middlwares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.VITE_FRONTEND_URL,
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
