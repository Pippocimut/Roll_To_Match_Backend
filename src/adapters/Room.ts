import { MongoDocument } from "data-types/temp"
import { PersistedRoom } from "database-models/Room"
import { PersistedCampaign } from "database-models/Campaign"
import CampaignAdapter, { AdaptedCampaign } from "./Campaign"
import { CampaignModel } from "database-models/Campaign"

export type PopulatedPersistedRoom = Omit<PersistedRoom, "campaigns"> & {
    campaigns: MongoDocument<PersistedCampaign>[]
}

export type AdaptedRoom = {
    id: string,
    owner: string,
    title: string,
    campaigns: AdaptedCampaign[],
}

export async function fromPersistedToReturnedRoom(persistedRoom: MongoDocument<PopulatedPersistedRoom>): Promise<AdaptedRoom> {
    let ownerObject = persistedRoom.owner
    let owner = 'Uknown'

    if (ownerObject) {
        owner = ownerObject.toString()
    }

    return {
        id: persistedRoom._id.toString(),
        owner: owner,
        title: persistedRoom.title,
        campaigns: persistedRoom.campaigns.map((campaign) => CampaignAdapter.fromPersistedToReturnedCampaign(campaign)),
    }
}