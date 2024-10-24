const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    groupId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Group' 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    content: { 
        type: String,
        required: true 
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);