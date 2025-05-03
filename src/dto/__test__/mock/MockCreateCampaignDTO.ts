import {CampaignTags, Days, Frequencies} from "@roll-to-match/types";
import { CreateCampaignDTO } from "@roll-to-match/dto";

export function getCreateCampaignDTO(createCampaignDTO?: Partial<CreateCampaignDTO>): CreateCampaignDTO {
    return {
        title: "title",
        description: "description",
        latitude: 0,
        longitude: 0,
        game: "D&D 5e",
        price: 5,
        schedule: {
            days: [Days.Thursday],
            time:"morning",
            frequency: Frequencies.Weekly
        },
        maxSeats: 5,
        tags: [CampaignTags.DND],
        ...createCampaignDTO
    }
}