import { z } from 'zod'
import { UserModel } from '../database_models/User'
export const UserCheckZodSchema = z.object({
    user: z.string(),
}).refine(data => {
    const getUser = UserModel.findById(data.user)
    if (!getUser) {
        throw new Error('User does not exist')
    }
})

export type UserCheckDTO = z.infer<typeof UserCheckZodSchema>