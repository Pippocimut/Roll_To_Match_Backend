import {CampaignTags, Days, Frequencies} from "@roll-to-match/types";
import {PersistedCampaign} from "@roll-to-match/models";

const {ObjectId, DocumentArray} = require('mongoose').Types;

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
        owner: new ObjectId(),
        room: new ObjectId(),
        game: "D&D",
        languages: [],
        schedule: {
            days: [Days.Thursday],
            time: "12:00",
            frequency: Frequencies.Weekly
        },
        image: "",
        requirements: "",
        price: 1.20,
        maxSeats: 1,
        ...campaign
    }
}