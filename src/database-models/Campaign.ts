import mongoose, {InferSchemaType} from "mongoose";
import {ReviewSchema} from "./Review";
import {UserSchema} from "./User";
import {CampaignTags, Days, Frequencies, MongoDocument} from "../data-types";
import {PersistedUser} from "./User";

export interface PersistedCampaign {
    title: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId;
    locationName? :string;
    location: {
        type: string;
        coordinates: number[];
    };
    schedule: {
        days: Days[],
        time: string;
        frequency: Frequencies
    },
    maxSeats: number;
    image: string;
    price: number;
    game: string;
    languages: string[];
    requirements: string;
    contactInfo?: string;
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
    schedule: {
        days: [{
            type: String,
            enum: Days,
            required: true,
        }],
        time: {
            type: String,
            required: true,
        },
        frequency: {
            type: String,
            enum: Frequencies,
            required: true,
        }
    },
    contactInfo: {
        type: String,
        required: false,
        default: ''
    },
    maxSeats: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    languages: [{
        type: String,
        required: true
    }],
    requirements: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false,
        default: 'https://via.placeholder.com/150'
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: false
    },
    game: {
        type: String,
        enum: ['D&D 5e', 'Pathfinder 2', 'Boardgames', 'Other'],
        default: 'D&D 5e',
        required: true
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
    locationName: {
        type: String,
        required: false,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
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

