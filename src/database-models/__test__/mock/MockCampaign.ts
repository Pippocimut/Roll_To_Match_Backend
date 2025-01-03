import { CampaignTags } from "@roll-to-match/types";
import { PersistedCampaign } from "@roll-to-match/models";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export function getMockCampaign(campaign?: Partial<PersistedCampaign>): PersistedCampaign {
    return {
        title: "title",
        description: "description",
        location: {
            type: "Point",
            coordinates: [0, 0]
        },
        tags: [CampaignTags.BOARDGAMES, CampaignTags.CARDGAMES],
        registeredAt: new Date(),
        playerQueue: new DocumentArray([]),
        activePlayers: new DocumentArray([]),
        reviews: new DocumentArray([]),
        owner: new ObjectId(),
        room: new ObjectId(),
        ...campaign
    }
}