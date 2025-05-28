import { z } from 'zod'
import {CampaignTags} from "../data-types/campaign-tags";
import {Days, Frequencies, Games} from "@roll-to-match/types";

export const UpdateCampaignZodSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.nativeEnum(CampaignTags)).optional(),
    latitude: z.number({message:"Not provided"}).optional(),
    longitude: z.number({message:"Not provided"}).optional(),
    price : z.number().optional(),
    image: z.string().optional(),
    nextSession: z.string().transform(date => new Date(date)).optional(),
    schedule: z.object({
        time: z.string().optional(),
        frequency: z.nativeEnum(Frequencies).optional(),
        days: z.array(z.nativeEnum(Days)).optional()
    }).optional(),
    game: z.nativeEnum(Games).optional(),
    languages: z.array(z.string()).optional(),
    requirements: z.string().optional(),
    maxSeats: z.number().optional(),
})

export type UpdateCampaignDTO = z.infer<typeof UpdateCampaignZodSchema>