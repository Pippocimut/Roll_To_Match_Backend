import { z } from 'zod'

export const LocalLoginUserZodSchema = z.object({
    username: z.string().min(3).max(256).transform(value => value.trim()).transform(value => value.toLowerCase()).optional(),
    email: z.string().email().min(6).max(256).transform(value => value.trim()).transform(value => value.toLowerCase()).optional(),
    password: z.string().min(6).max(1024).transform(value => value.trim()).transform(value => value.toLowerCase()),
    slug: z.string().min(3).max(256).optional()
}).refine(data => {
    if (!data.username && !data.email && !data.slug){
        throw new Error('Username or email or slug is required')
    }
    return true
});


export type LocalLoginUserDTO = z.infer<typeof LocalLoginUserZodSchema>