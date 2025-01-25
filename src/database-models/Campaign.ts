import mongoose, { InferSchemaType } from "mongoose";
import { ReviewSchema } from "./Review";
import { UserSchema } from "./User";
import { CampaignTags, MongoDocument } from "../data-types";
import { PersistedUser } from "./User";

export interface PersistedCampaign {
    title: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId;
    location: {
        type: string;
        coordinates: number[];
    };
    tags: string[];
    registeredAt: Date;
    reviews: any[];
    playerQueue: MongoDocument<PersistedUser>[];
    activePlayers: MongoDocument<PersistedUser>[];
}

export const CampaignSchema = new mongoose.Schema<PersistedCampaign>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    room: {
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
        required: true,
        enum: CampaignTags
    }],
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    playerQueue: [{
        type: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            username: String,
            email: String,
            slug: String,
            date: Date,
        },
        required: false,
        default: []
    }],
    activePlayers: [{
        type: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            username: String,
            email: String,
            slug: String,
            date: Date,
        },
        required: false,
        default: []
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

export const CampaignModel = mongoose.model<PersistedCampaign>('Campaign', CampaignSchema);

