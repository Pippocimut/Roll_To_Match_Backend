const mongoose = require('mongoose');
const { topics } = require('../types');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    likes: {
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    dislikes: {
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            message: {
                type: String,
                required: true
            },
            registeredAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    registeredAt: {
        type: Date,
        default: Date.now
    },
    topic: {
        type: String,
        enum: topics
    },
    message: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Post', PostSchema);