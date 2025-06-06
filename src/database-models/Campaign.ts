import mongoose from "mongoose";
import {Days, Frequencies, Games, MongoDocument} from "../data-types";
import {PersistedUser} from "./User";
import {CampaignTags} from "../data-types/campaign-tags";
import {PersistedRoom} from "./Room";

export interface PopulatedPersistedCampaign extends Omit<PersistedCampaign,
    "owner"> {
    owner: MongoDocument<PersistedUser>
}

export interface PersistedCampaign {
    title: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId;
    locationName?: string;
    nextSession?: Date;
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
    game: Games;
    languages: string[];
    requirements: string;
    contactInfo?: string;
    tags: CampaignTags[];
    registeredAt: Date;
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
    nextSession: {
        type: Date,
        required: false,
        default: null,
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
        enum: Games,
        default: Games.DND5E,
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    tags: [{
        type: String,
        enum: CampaignTags,
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

