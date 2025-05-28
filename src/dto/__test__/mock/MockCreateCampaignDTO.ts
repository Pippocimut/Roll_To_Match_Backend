import {Days, Frequencies, Games} from "@roll-to-match/types";
import { CreateCampaignDTO } from "@roll-to-match/dto";
import {CampaignTags} from "../../../data-types/campaign-tags";

export function getCreateCampaignDTO(createCampaignDTO?: Partial<CreateCampaignDTO>): CreateCampaignDTO {
    return {
        title: "title",
        description: "description",
        latitude: 0,
        longitude: 0,
        game: Games.DND5E,
        price: 5,
        image:"dada",
        schedule: {
            days: [Days.Thursday],
            time:"morning",
            frequency: Frequencies.Weekly
        },
        maxSeats: 5,
        tags: [CampaignTags.violence],
        ...createCampaignDTO
    }
}