import { z } from 'zod'
import { RoomModel } from '../database-models/Room'

export const UpdateCampaignZodSchema = z.object({
    title: z.string(),
    description: z.string(),
    owner: z.string(),
    room: z.string(),
    location: z.string().optional(),
    tags: z.array(z.string()).min(1),
}).refine(data => {
    const getRoom = RoomModel.findById(data.room)
    if (!getRoom) {
        throw new Error('Room does not exist')
    }
    return true
})


export type UpdateCampaignDTO = z.infer<typeof UpdateCampaignZodSchema>