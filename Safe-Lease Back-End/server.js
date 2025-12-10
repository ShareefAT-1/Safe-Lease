// =============================
// Safe-Lease Backend Server.js
// =============================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

console.log('Backend Loading FRONTEND_URL from .env:', process.env.FRONTEND_URL);

// Models
const User = require('./models/User-model');
const Message = require('./models/Message-model');

const app = express();
const server = http.createServer(app);

// =============================
// SOCKET.IO SETUP
// =============================
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// =============================
// MIDDLEWARE
// =============================
app.use(express.json());

app.use(cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
}));

// STATIC SERVING FOR UPLOADED FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================
// MONGO DB CONNECTION
// =============================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// =============================
// API ROUTES
// =============================
const authRoutes = require('./Routes/auth-route');
const propertyRoutes = require('./Routes/property-route');
const agreementRoutes = require('./Routes/agreement-route');
const userRoutes = require('./Routes/user-route');   // <-- Added!

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/users', userRoutes);                   // <-- Added!

app.get('/', (req, res) => {
    res.send('Safe-Lease Backend API is running!');
});

// =============================
// ERROR HANDLER
// =============================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Something went wrong!',
    });
});

// =============================
// SOCKET.IO CHAT LOGIC
// =============================
io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Auth token from handshake
    const token = socket.handshake.query.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;

            console.log(`Socket ${socket.id} authenticated as User ID: ${socket.userId}`);
        } catch (err) {
            console.error("Socket auth failed:", err.message);
            socket.emit("authError", "Authentication failed.");
            socket.disconnect();
            return;
        }
    } else {
        socket.emit("authError", "No authentication token provided.");
        socket.disconnect();
        return;
    }

    // JOIN A CHAT ROOM
    socket.on('joinRoom', async ({ conversationId }) => {

        // Leave all previous rooms except itself
        socket.rooms.forEach(room => {
            if (room !== socket.id) socket.leave(room);
        });

        socket.join(conversationId);
        console.log(`User ${socket.userId} joined room: ${conversationId}`);

        try {
            const messages = await Message.find({ conversation: conversationId })
                .populate('sender', 'name username profilePic')
                .sort({ timestamp: 1 })
                .lean();

            socket.emit('chatHistory', messages);
        } catch (err) {
            console.error("Chat history load error:", err);
            socket.emit('error', 'Failed to load chat history.');
        }
    });

    // SEND A MESSAGE
    socket.on('sendMessage', async ({ conversationId, content }) => {
        if (!content || !content.trim()) {
            return socket.emit('error', 'Message cannot be empty.');
        }

        try {
            const sender = await User.findById(socket.userId, 'name username profilePic').lean();
            if (!sender) return socket.emit('error', 'Sender not found.');

            const newMessage = new Message({
                conversation: conversationId,
                sender: socket.userId,
                content: content.trim(),
            });

            await newMessage.save();

            io.to(conversationId).emit('receiveMessage', {
                _id: newMessage._id,
                conversationId,
                sender,
                content: newMessage.content,
                timestamp: newMessage.timestamp,
            });

        } catch (error) {
            console.error("Message send error:", error);
            socket.emit('error', 'Failed to send message.');
        }
    });

    socket.on('disconnect', () => {
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
