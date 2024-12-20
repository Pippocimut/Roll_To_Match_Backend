import mongoose, { InferSchemaType } from 'mongoose';

export const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export const UserModel = mongoose.model('User', UserSchema);

export type PersistedUser = InferSchemaType<typeof UserSchema>;