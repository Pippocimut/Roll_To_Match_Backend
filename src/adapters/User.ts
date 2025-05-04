import { MongoDocument } from "data-types/temp"
import { PersistedUser } from "../database-models/User"
import mongoose from "mongoose";

export type AdaptedUser = {
    username: string,
    email: string,
    imageUrl?: string,
    id: string,
}

export function fromPersistedToReturnedUser(persistedPlayer: mongoose.Document<PersistedUser>): AdaptedUser  {
    const userDoc = persistedPlayer.toObject() as PersistedUser;

    return {
        id: persistedPlayer._id.toString(),
        username: userDoc.username,
        email: userDoc.email,
        imageUrl: userDoc.imageUrl || undefined
    }
}

export default {
    fromPersistedToReturnedUser
}