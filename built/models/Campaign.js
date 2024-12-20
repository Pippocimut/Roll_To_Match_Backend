"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignModel = exports.CampaignSchema = exports.ReviewScheam = exports.PlayerSchema = void 0;
var mongoose_1 = require("mongoose");
exports.PlayerSchema = new mongoose_1.default.Schema({
    id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    slug: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    }
});
exports.ReviewScheam = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    stars: {
        type: Number,
        required: true,
        default: 7
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});
exports.CampaignSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    likes: {
        users: [{
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            }]
    },
    dislikes: {
        users: [{
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            }]
    },
    reviews: [exports.ReviewScheam],
    registeredAt: {
        type: Date,
        default: Date.now
    },
    tags: [{
            type: String,
            required: true
        }],
    playerQueue: [exports.PlayerSchema],
    activePlayers: [exports.PlayerSchema],
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    }
});
exports.CampaignModel = mongoose_1.default.model('Campaign', exports.CampaignSchema);
//# sourceMappingURL=Campaign.js.map