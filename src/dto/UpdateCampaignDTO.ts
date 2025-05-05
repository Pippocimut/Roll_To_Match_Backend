import { z } from 'zod'
import { RoomModel } from '../database-models/Room'
import {CampaignTags} from "@roll-to-match/types";

export const UpdateCampaignZodSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.nativeEnum(CampaignTags)).optional(),
    latitude: z.number({message:"Not provided"}).optional(),
    longitude: z.number({message:"Not provided"}).optional(),
    price : z.number().optional(),
    nextSession: z.date().optional(),
    schedule: z.object({
        time: z.string().optional(),
        frequency: z.string().optional(),
        days: z.array(z.string()).optional()
    }).optional(),
    game: z.enum(['D&D 5e', 'D&D 3.5e', 'Pathfinder 2', 'Boardgames', 'Other']).optional(),
    languages: z.array(z.string()).optional(),
    requirements: z.string().optional(),
    maxSeats: z.number().optional(),
})

export type UpdateCampaignDTO = z.infer<typeof UpdateCampaignZodSchema>