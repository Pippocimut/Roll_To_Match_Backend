import { z } from 'zod'

export const UpdateUserZodSchema = z.object({
    username: z.string().min(3).max(256).optional(),
    email: z.string().email().min(6).max(256).optional(),
    slug: z.string().min(3).max(256).optional(),
    imageUrl: z.string().optional()
})

export type UpdateUserDTO = z.infer<typeof UpdateUserZodSchema>