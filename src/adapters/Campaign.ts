import { PersistedCampaign } from "../database-models/Campaign";
import { MongoDocument } from "../data-types";
import { AdaptedPlayer } from "./Player";
import { fromPersistedToReturnedPlayer } from "./Player";
import { PersistedUser } from "../database-models/User";

export type AdaptedCampaign = {
    id: string,
    title: string,
    description: string,
    owner: string,
    room: string,
    location: {
        type: string,
        coordinates: number[]
    },
    tags: string[],
    registeredAt: Date,
    reviews: any[],
    playerQueue: AdaptedPlayer[],
    activePlayers: AdaptedPlayer[],
}

function fromPersistedToReturnedCampaign(persistedCampaign: MongoDocument<PersistedCampaign>): AdaptedCampaign {
    const playerQueue = persistedCampaign.playerQueue.map(player => fromPersistedToReturnedPlayer(player))
    const activePlayers = persistedCampaign.activePlayers.map(player => fromPersistedToReturnedPlayer(player))

    return {
        id: persistedCampaign._id.toString(),
        title: persistedCampaign.title,
        description: persistedCampaign.description,
        owner: persistedCampaign.owner.toString(),
        room: persistedCampaign.room.toString(),
        location: persistedCampaign.location,
        tags: persistedCampaign.tags,
        registeredAt: persistedCampaign.registeredAt,
        reviews: persistedCampaign.reviews,
        playerQueue,
        activePlayers,
    }
}

export default { fromPersistedToReturnedCampaign }
