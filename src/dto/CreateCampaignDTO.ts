import { z } from 'zod'
import { CampaignTags } from '../data-types'

export const CreateCampaignZodSchema = z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.nativeEnum(CampaignTags)).min(1).optional(),
    location : z.object({
        lat: z.number(),
        lng: z.number()
    }).optional()
})

export type CreateCampaignDTO = z.infer<typeof CreateCampaignZodSchema>