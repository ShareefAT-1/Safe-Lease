const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: String, // Or ObjectId, if linking to a specific conversation document
        required: true,
        index: true // For efficient querying
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to your User model
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Message', messageSchema);