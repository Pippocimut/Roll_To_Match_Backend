"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.ReviewSchema = new mongoose_1.default.Schema({
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
//# sourceMappingURL=Review.js.map