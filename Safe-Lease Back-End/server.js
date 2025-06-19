// Safe-Lease Back-End/server.js
const express = require('express');
const http = require('http'); // Import Node.js http module
const { Server } = require('socket.io'); // Import Socket.IO Server
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for Socket.IO auth
require('dotenv').config();

// Import your Mongoose models
const User = require('./models/User-model'); // Assuming your User model path
const Message = require('./models/Message-model'); // Import the new Message model

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth-route');
const propertyRoutes = require('./routes/property-route');
// const agreementRoutes = require('./routes/agreement-route'); // Uncomment when you create this
// const userRoutes = require('./routes/user-route'); // COMMENTED OUT: This was causing the error

app.use('/auth', authRoutes);
app.use('/properties', propertyRoutes);
// app.use('/agreements', agreementRoutes); // Uncomment when you create this
// app.use('/users', userRoutes); // COMMENTED OUT: This was causing the error


// ----------------------------------------------------
// Socket.IO Chat Logic
// ----------------------------------------------------

io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // --- Socket.IO Authentication (using JWT from frontend) ---
    const token = socket.handshake.query.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId; // Attach user ID to the socket
            console.log(`Socket ${socket.id} authenticated as User ID: ${socket.userId}`);
        } catch (err) {
            console.error(`Socket ${socket.id} authentication failed: ${err.message}`);
            socket.emit('authError', 'Authentication failed: Invalid token.');
            socket.disconnect(); // Disconnect unauthenticated sockets
            return;
        }
    } else {
        console.log(`Socket ${socket.id} unauthenticated (no token)`);
        socket.emit('authError', 'Authentication required.');
        socket.disconnect();
        return;
    }
    // ---------------------------------------------------

    // Event for joining a specific chat room (e.g., based on property ID)
    socket.on('joinRoom', async ({ conversationId }) => {
        // Leave any previously joined rooms (optional, but good for single-room focus)
        socket.rooms.forEach(room => {
            if (room !== socket.id) { // Don't leave the default personal room
                socket.leave(room);
            }
        });

        socket.join(conversationId);
        console.log(`User ${socket.userId} joined room: ${conversationId}`);

        // Load chat history for this room from MongoDB
        try {
            const messages = await Message.find({ conversation: conversationId })
                                        .populate('sender', 'username') // Populate sender's username
                                        .sort({ timestamp: 1 })
                                        .lean(); // Use .lean() for faster query results
            socket.emit('chatHistory', messages);
        } catch (error) {
            console.error("Error fetching chat history:", error);
            socket.emit('error', 'Failed to load chat history.');
        }
    });

    // Event for sending messages
    socket.on('sendMessage', async ({ conversationId, content }) => {
        if (!socket.userId) { // Ensure user is authenticated
            return socket.emit('error', 'Authentication required to send messages');
        }
        if (!content || !content.trim()) {
            return socket.emit('error', 'Message content cannot be empty.');
        }

        try {
            // Find the sender's username to include in the message for display
            const senderUser = await User.findById(socket.userId, 'username').lean();
            if (!senderUser) {
                return socket.emit('error', 'Sender user not found.');
            }

            const newMessage = new Message({
                conversation: conversationId,
                sender: socket.userId,
                content: content.trim(),
            });

            await newMessage.save();

            // Emit the message to everyone in the room
            io.to(conversationId).emit('receiveMessage', {
                _id: newMessage._id,
                conversationId,
                sender: { _id: senderUser._id, username: senderUser.username }, // Include populated sender info
                content: newMessage.content,
                timestamp: newMessage.timestamp,
            });
        } catch (error) {
            console.error("Error saving/sending message:", error);
            socket.emit('error', 'Failed to send message.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => { // Make sure to use server.listen, not app.listen
    console.log(`Server running on port ${PORT}`);
});