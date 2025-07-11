const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: String, 
        required: true,
        index: true 
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
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