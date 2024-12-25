import { z } from 'zod'
import { RoomModel } from '../database_models/Room'

export const CreateCampaignZodSchema = z.object({
    title: z.string(),
    description: z.string(),
    room: z.string(),
    tags: z.array(z.string()).min(1),
    location : z.string().optional()
}).refine(data => {
    const getRoom = RoomModel.findById(data.room)
    if (!getRoom) {
        throw new Error('Room does not exist')
    }
    return true
})

export type CreateCampaignDTO = z.infer<typeof CreateCampaignZodSchema>