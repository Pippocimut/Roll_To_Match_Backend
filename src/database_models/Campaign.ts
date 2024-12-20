import mongoose, { InferSchemaType } from "mongoose";
import { decodedTextSpanIntersectsWith } from "typescript";

export const PlayerSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
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

export const ReviewScheam = new mongoose.Schema({
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

export const CampaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    room : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: false
    },
    reviews: [{
        type: ReviewScheam,
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
        type: PlayerSchema,
        required: false,
        default: []
    }],
    activePlayers: [{
        type: PlayerSchema,
        required: false,
        default: []
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export const CampaignModel = mongoose.model('Campaign', CampaignSchema);

export type PersistedCampaign = InferSchemaType<typeof CampaignSchema>;

