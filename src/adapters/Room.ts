import { MongoDocument } from "data-types/temp"
import { PersistedRoom } from "database-models/Room"
import CampaignAdapter, { AdaptedCampaign } from "./Campaign"
import { CampaignModel } from "database-models/Campaign"

export type AdaptedRoom = {
    id: string,
    owner: string,
    campaigns: AdaptedCampaign[],
}

export async function fromPersistedToReturnedRoom(persistedRoom: MongoDocument<PersistedRoom>): Promise<AdaptedRoom> {
    return {
        id: persistedRoom._id.toString(),
        owner: persistedRoom.owner.toString(),
        campaigns: await Promise.all(persistedRoom.campaigns.map(async (campaign) => CampaignAdapter.fromPersistedToReturnedCampaign(await CampaignModel.findById(campaign) ))),
    }
}