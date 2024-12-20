"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignModel = exports.CampaignSchema = exports.ReviewScheam = exports.PlayerSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
    description: {
        type: String,
        required: true
    },
    room: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Room',
        required: false
    },
    reviews: [{
            type: exports.ReviewScheam,
            required: false,
            default: []
        }],
    registeredAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    tags: [{
            type: String,
            required: true
        }],
    playerQueue: [{
            type: exports.PlayerSchema,
            required: false,
            default: []
        }],
    activePlayers: [{
            type: exports.PlayerSchema,
            required: false,
            default: []
        }],
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    }
});
exports.CampaignModel = mongoose_1.default.model('Campaign', exports.CampaignSchema);
//# sourceMappingURL=Campaign.js.map