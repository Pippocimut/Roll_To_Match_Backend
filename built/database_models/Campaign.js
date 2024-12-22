"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignModel = exports.CampaignSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Review_1 = require("./Review");
const Player_1 = require("./Player");
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
            type: Review_1.ReviewSchema,
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
            type: Player_1.PlayerSchema,
            required: false,
            default: []
        }],
    activePlayers: [{
            type: Player_1.PlayerSchema,
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