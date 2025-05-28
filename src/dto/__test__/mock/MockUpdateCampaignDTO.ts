import {UpdateCampaignDTO} from "@roll-to-match/dto";

export function getUpdateCampaignDTO(updateCampaignDTO?: Partial<UpdateCampaignDTO>): Partial<UpdateCampaignDTO> {
    return {
        ...updateCampaignDTO
    }
}