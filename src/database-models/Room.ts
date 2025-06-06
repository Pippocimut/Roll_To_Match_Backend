import mongoose, { InferSchemaType } from 'mongoose';
import { PersistedCampaign } from './Campaign';
import { PersistedUser } from './User';

const RoomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    campaigns: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Campaign'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export const RoomModel = mongoose.model('Room', RoomSchema);

export type PersistedRoom = InferSchemaType<typeof RoomSchema>;
