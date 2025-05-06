import { z } from 'zod'
import { Days, Frequencies} from '@roll-to-match/types'
import {CampaignTags} from "../data-types/campaign-tags";

export const CreateCampaignZodSchema = z.object({
    title: z.string(),
    description: z.string(),
    locationName : z.string().optional(),
    latitude: z.number({message:"Not provided"}).optional(),
    longitude: z.number({message:"Not provided"}).optional(),
    price : z.number().default(0),
    contactInfo: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.nativeEnum(CampaignTags)).optional(),
    nextSession: z.string().transform(date => new Date(date)).optional(),
    schedule: z.object({
        time: z.string(),
        frequency: z.string(z.nativeEnum(Frequencies)),
        days: z.array(z.nativeEnum(Days))
    }),
    game: z.enum(['D&D 5e', 'D&D 3.5e', 'Pathfinder 2', 'Boardgames', 'Other']).optional().default('D&D 5e'),
    languages: z.array(z.string()).optional(),
    requirements: z.string().optional(),
    maxSeats: z.number(),
})

export type CreateCampaignDTO = z.infer<typeof CreateCampaignZodSchema>