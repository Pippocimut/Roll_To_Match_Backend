import { PersistedCampaign } from "../database_models/Campaign";
import { MongoDocument } from "../types";

function fromPersistedToReturnedCampaign(persistedCampaign: MongoDocument<PersistedCampaign>): MongoDocument<PersistedCampaign> {
    return {
        _id: persistedCampaign._id,
        title: persistedCampaign.title,
        description: persistedCampaign.description,
        owner: persistedCampaign.owner,
        room: persistedCampaign.room,
        location: persistedCampaign.location,
        tags: persistedCampaign.tags,
        registeredAt: persistedCampaign.registeredAt,
        reviews: persistedCampaign.reviews,
        playerQueue: persistedCampaign.playerQueue,
        activePlayers: persistedCampaign.activePlayers,
    }
}

export default { fromPersistedToReturnedCampaign }
