import { z } from 'zod'
import { CampaignTags } from '../data-types'

export const CreateCampaignZodSchema = z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.nativeEnum(CampaignTags)).min(1).optional(),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(),
    game: z.enum(['D&D', 'Pathfinder', 'Boardgames', 'Other']).optional().default('D&D')
})

export type CreateCampaignDTO = z.infer<typeof CreateCampaignZodSchema>