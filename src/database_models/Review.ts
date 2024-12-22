import mongoose, { InferSchemaType } from "mongoose";

export const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
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
})

export type PersistedReview = InferSchemaType<typeof ReviewSchema>;