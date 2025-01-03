import { z } from 'zod'
import { CampaignModel } from '../database-models/Campaign'

export const CampaignCheckZodSchema = z.object({
    id: z.string(),
}).refine(data => {
    const getUser = CampaignModel.findById(data.id)
    if (!getUser) {
        return false
    }
    return true
}).transform(async (data) => {
    return {
        ...data,
        campaign: await CampaignModel.findById(data.id)
    }
})

export type CampaignCheckDTO = z.infer<typeof CampaignCheckZodSchema>