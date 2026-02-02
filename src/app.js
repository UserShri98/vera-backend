const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

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
    origin: "http://localhost::5173",
    credentials: true,
  }),
);
app.use(express.static(path.join(__dirname, "../public")));

// Serving frontend
app.get("*name", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
