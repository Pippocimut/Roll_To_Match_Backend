import { MongoDocument } from "data-types/temp"
import { PersistedUser } from "../database-models/User"

export type AdaptedPlayer = {
    id: string,
    username: string,
    email: string,
}

export function fromPersistedToReturnedPlayer(persistedPlayer: MongoDocument<PersistedUser>): AdaptedPlayer {
    return {
        id: persistedPlayer._id.toString(),
        username: persistedPlayer.username,
        email: persistedPlayer.email,
    }
}

export default {
    fromPersistedToReturnedPlayer
}