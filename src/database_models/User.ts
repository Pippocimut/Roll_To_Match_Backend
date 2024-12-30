import mongoose, { Schema, InferSchemaType } from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

UserSchema.set('discriminatorKey', 'kind');

const GoogleUserSchema = new Schema({
    googleId: {
        type: String,
        required: true
    }
});

const FacebookUserSchema = new Schema({
    facebookId: {
        type: String,
        required: true
    }
});

const LocalUserSchema = new Schema({
    password: {
        type: String,
        required: true
    }
});

const UserModel = mongoose.model('User', UserSchema);
const GoogleUserModel = UserModel.discriminator('GoogleUser', GoogleUserSchema);
const FacebookUserModel = UserModel.discriminator('FacebookUser', FacebookUserSchema);
const LocalUserModel = UserModel.discriminator('LocalUser', LocalUserSchema);

export { UserModel, GoogleUserModel, FacebookUserModel, LocalUserModel };

export type PersistedUser = InferSchemaType<typeof UserSchema>;
export type PersistedGoogleUser = InferSchemaType<typeof GoogleUserSchema> & PersistedUser;
export type PersistedLocalUser = InferSchemaType<typeof LocalUserSchema> & PersistedUser;