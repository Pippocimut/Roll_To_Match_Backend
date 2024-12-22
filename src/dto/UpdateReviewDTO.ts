import { z } from 'zod'

export const UpdateReviewZodSchema = z.object({
    title: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
    stars: z.number().min(1).max(6).optional(),
})

export type UpdateReviewDTO = z.infer<typeof UpdateReviewZodSchema>