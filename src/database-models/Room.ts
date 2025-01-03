import mongoose, { InferSchemaType } from 'mongoose';

const RoomSchema = new mongoose.Schema({
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