import { z } from 'zod'
import { RoomModel } from '../database-models/Room'

export const UpdateCampaignZodSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    owner: z.string().optional(),
    room: z.string().optional(),
    location: z.string().optional(),
    tags: z.array(z.string()).min(1).optional(),
}).refine(data => {
    const getRoom = RoomModel.findById(data.room)
    if (!getRoom) {
        throw new Error('Room does not exist')
    }
    return true
})


export type UpdateCampaignDTO = z.infer<typeof UpdateCampaignZodSchema>