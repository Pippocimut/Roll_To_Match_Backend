import { PersistedCampaign } from "../database-models/Campaign";
import { MongoDocument } from "../data-types";

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
    playerQueue: any[],
    activePlayers: any[],
}

function fromPersistedToReturnedCampaign(persistedCampaign: MongoDocument<PersistedCampaign>): AdaptedCampaign {
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
        playerQueue: persistedCampaign.playerQueue,
        activePlayers: persistedCampaign.activePlayers,
    }
}

export default { fromPersistedToReturnedCampaign }
