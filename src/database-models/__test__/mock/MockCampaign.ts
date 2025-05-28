import {Days, Frequencies, Games} from "@roll-to-match/types";
import {PersistedCampaign} from "@roll-to-match/models";
import {CampaignTags} from "../../../data-types/campaign-tags";

const {ObjectId, DocumentArray} = require('mongoose').Types;

export function getMockCampaign(campaign?: Partial<PersistedCampaign>): PersistedCampaign {
    return {
        title: "title",
        description: "description",
        location: {
            type: "Point",
            coordinates: [0, 0]
        },
        tags: [CampaignTags.violence],
        registeredAt: new Date(),
        playerQueue: new DocumentArray([]),
        activePlayers: new DocumentArray([]),
        owner: new ObjectId(),
        room: new ObjectId(),
        game: Games.DND5E,
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