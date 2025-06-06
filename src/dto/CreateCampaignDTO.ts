import {z} from 'zod'
import {Days, Frequencies, Games} from '@roll-to-match/types'
import {CampaignTags} from "../data-types/campaign-tags";

export const CreateCampaignZodSchema = z.object({
    title: z.string(),
    description: z.string(),
    locationName: z.string().optional(),
    latitude: z.number({message: "Not provided"}).optional(),
    longitude: z.number({message: "Not provided"}).optional(),
    price: z.number().min(0).default(0),
    contactInfo: z.string().optional(),
    image: z.string(),
    tags: z.array(z.nativeEnum(CampaignTags)).optional(),
    nextSession: z.string().transform(date => new Date(date)).refine(
        date => date > new Date(),
        {message: "Next session must be in the future"}).optional(),
    schedule: z.object({
        time: z.string(),
        frequency: z.string(z.nativeEnum(Frequencies)),
        days: z.array(z.nativeEnum(Days))
    }),
    game: z.nativeEnum(Games).optional().default(Games.DND5E),
    languages: z.array(z.string()).optional(),
    requirements: z.string().optional(),
    maxSeats: z.number(),
})

export type CreateCampaignDTO = z.infer<typeof CreateCampaignZodSchema>