import { CampaignTags } from "@roll-to-match/types";
import { CreateCampaignDTO } from "@roll-to-match/dto";
const { ObjectId } = require('mongoose').Types;

export function getCreateCampaignDTO(createCampaignDTO?: Partial<CreateCampaignDTO>): CreateCampaignDTO {
    return {
        title: "title",
        description: "description",
        location: {
            lat: 0,
            lng: 0
        },
        tags: [CampaignTags.DND],
        room: new ObjectId(),
        ...createCampaignDTO
    }
}