import { z } from 'zod'
import { UserModel } from '../database_models/User'

export const LocalRegisterUserZodSchema = z.object({
    username: z.string().min(3).max(256),
    email: z.string().email().min(6).max(256),
    password: z.string().min(6).max(1024),
    slug: z.string().min(3).max(256)
}).refine(data => {
    const userExists = UserModel.findOne({ 
        $or: [
            { email: data.email },
            { username: data.username },
            { slug: data.slug }
        ]
    })
    if (userExists) {
        throw new Error('User already exists')
    }
    return true
});


export type LocalRegisterUserDTO = z.infer<typeof LocalRegisterUserZodSchema>