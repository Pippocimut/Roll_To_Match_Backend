import {Days, Frequencies, Games} from "@roll-to-match/types";
import {PersistedCampaign, PersistedUser} from "@roll-to-match/models";
import {CampaignTags} from "../../../data-types/campaign-tags";

const {ObjectId, DocumentArray} = require('mongoose').Types;

export function getMockUser(user?: Partial<PersistedUser>): PersistedUser {
    return {
        slug: "Mock",
        username: "Mock",
        date: new Date(),
        email: "Mock",
        imageUrl: "Mock",
        ...user
    }
}