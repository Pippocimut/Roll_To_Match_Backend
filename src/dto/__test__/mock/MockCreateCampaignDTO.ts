import { CampaignTags } from "@roll-to-match/types";
import { CreateCampaignDTO } from "@roll-to-match/dto";

export function getCreateCampaignDTO(createCampaignDTO?: Partial<CreateCampaignDTO>): CreateCampaignDTO {
    return {
        title: "title",
        description: "description",
        location: {
            lat: 0,
            lng: 0
        },
        game: "D&D",
        tags: [CampaignTags.DND],
        ...createCampaignDTO
    }
}