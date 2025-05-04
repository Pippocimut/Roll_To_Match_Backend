import { z } from 'zod'
import { Days, Frequencies} from '@roll-to-match/types'

export const CreateCampaignZodSchema = z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    locationName : z.string().optional(),
    latitude: z.number({message:"Not provided"}).optional(),
    longitude: z.number({message:"Not provided"}).optional(),
    price : z.number().default(0),
    contactInfo: z.string().optional(),
    image: z.string().optional(),
    nextSession: z.date().optional(),
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