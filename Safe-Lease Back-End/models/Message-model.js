// Safe-Lease Back-End/models/Message-model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // 'conversation' will likely be the property ID for buyer-seller chats
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property', // Refers to the Property model
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to your User model
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Mongoose will add createdAt and updatedAt automatically

module.exports = mongoose.model('Message', messageSchema);