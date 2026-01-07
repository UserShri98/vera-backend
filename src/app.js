const express = require("express");
const cookieParser = require("cookie-parser");

// importing routes
const authRoutes = require("./routes/auth.routes")
const chatRoutes = require("./routes/chat.routes")

// creating a server
const app = express();

// Middlwares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth",authRoutes)
app.use("/api/chat",chatRoutes)

module.exports = app;
