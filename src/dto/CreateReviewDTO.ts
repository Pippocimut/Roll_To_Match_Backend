import { z } from 'zod'
import { RoomModel } from '../database-models/Room'

export const CreateReviewZodSchema = z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    stars: z.number().min(1).max(6),
})

export type CreateReviewDTO = z.infer<typeof CreateReviewZodSchema>