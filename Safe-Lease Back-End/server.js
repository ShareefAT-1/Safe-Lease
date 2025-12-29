// =============================
// Safe-Lease Backend Server.js
// =============================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// STATIC FILES (UPLOADS)
// =============================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =============================
// SOCKET.IO SETUP
// =============================
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// =============================
// MONGO DB CONNECTION
// =============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// =============================
// API ROUTES
// =============================
const authRoutes = require("./Routes/auth-route");
const propertyRoutes = require("./Routes/property-route");
const agreementRoutes = require("./Routes/agreement-route");
const userRoutes = require("./Routes/user-route");

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Safe-Lease Backend API is running!");
});

// =============================
// SOCKET.IO CHAT LOGIC
// =============================
const User = require("./models/User-model");
const Message = require("./models/Message-model");

io.on("connection", async (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  const token = socket.handshake.query.token;

  if (!token) {
    socket.emit("authError", "No authentication token provided.");
    socket.disconnect();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
  } catch {
    socket.emit("authError", "Authentication failed.");
    socket.disconnect();
    return;
  }

  socket.on("joinRoom", async ({ conversationId }) => {
    socket.join(conversationId);

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name profilePic")
      .sort({ timestamp: 1 });

    socket.emit("chatHistory", messages);
  });

  socket.on("sendMessage", async ({ conversationId, content }) => {
    if (!content?.trim()) return;

    const sender = await User.findById(socket.userId, "name profilePic");
    if (!sender) return;

    const msg = new Message({
      conversation: conversationId,
      sender: socket.userId,
      content: content.trim(),
    });

    await msg.save();

    io.to(conversationId).emit("receiveMessage", {
      _id: msg._id,
      conversationId,
      sender,
      content: msg.content,
      timestamp: msg.timestamp,
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
