const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const mongoose = require('mongoose');
const cors = require('cors'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

console.log('Backend Loading FRONTEND_URL from .env:', process.env.FRONTEND_URL);

const User = require('./models/User-model'); 
const Message = require('./models/Message-model'); 

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,
}));


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const authRoutes = require('./Routes/auth-route');
const propertyRoutes = require('./Routes/property-route');
const agreementRoutes = require('./Routes/agreement-route'); 

app.use('/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agreements', agreementRoutes);


app.get('/', (req, res) => {
    res.send('Safe-Lease Backend API is running!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ message: err.message || 'Something went wrong!' });
});


io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const token = socket.handshake.query.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId; 
            console.log(`Socket ${socket.id} authenticated as User ID: ${socket.userId}`);
        } catch (err) {
            console.error(`Socket ${socket.id} authentication failed: ${err.message}`);
            socket.emit('authError', 'Authentication failed: Invalid token.');
            socket.disconnect(); 
            return;
        }
    } else {
        console.log(`Socket ${socket.id} unauthenticated (no token)`);
        socket.emit('authError', 'Authentication required.');
        socket.disconnect();
        return;
    }

    socket.on('joinRoom', async ({ conversationId }) => {
        socket.rooms.forEach(room => {
            if (room !== socket.id) { 
                socket.leave(room);
            }
        });

        socket.join(conversationId);
        console.log(`User ${socket.userId} joined room: ${conversationId}`);

        try {
            const messages = await Message.find({ conversation: conversationId })
                                        .populate('sender', 'name username profilePic') 
                                        .sort({ timestamp: 1 })
                                        .lean(); 
            socket.emit('chatHistory', messages);
        } catch (error) {
            console.error("Error fetching chat history:", error);
            socket.emit('error', 'Failed to load chat history.');
        }
    });

    socket.on('sendMessage', async ({ conversationId, content }) => {
        if (!socket.userId) { 
            return socket.emit('error', 'Authentication required to send messages');
        }
        if (!content || !content.trim()) {
            return socket.emit('error', 'Message content cannot be empty.');
        }

        try {
            const senderUser = await User.findById(socket.userId, 'name username profilePic').lean(); 
            if (!senderUser) {
                return socket.emit('error', 'Sender user not found.');
            }

            const newMessage = new Message({
                conversation: conversationId,
                sender: socket.userId,
                content: content.trim(),
            });

            await newMessage.save();

            io.to(conversationId).emit('receiveMessage', {
                _id: newMessage._id,
                conversationId,
                sender: { _id: senderUser._id, name: senderUser.name, username: senderUser.username, profilePic: senderUser.profilePic }, 
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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`);
});