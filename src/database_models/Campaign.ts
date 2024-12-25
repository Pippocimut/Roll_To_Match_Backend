import mongoose, { InferSchemaType } from "mongoose";
import { ReviewSchema } from "./Review";
import { PlayerSchema } from "./Player";

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
        type: ReviewSchema,
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
    location: {
        type: String,
        required: false
    },
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

