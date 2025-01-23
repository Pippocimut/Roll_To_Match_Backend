import mongoose, { InferSchemaType } from "mongoose";

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
    },
    username: {
        type: String,
        required: false
    }
});

export const PlayerModel = mongoose.model('Player', PlayerSchema);

export type PersistedPlayer = InferSchemaType<typeof PlayerSchema>;