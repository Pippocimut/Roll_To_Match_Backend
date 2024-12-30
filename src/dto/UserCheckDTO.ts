import { z } from 'zod'
import { UserModel } from '../database_models/User'
export const UserCheckZodSchema = z.object({
    id: z.string(),
}).refine(data => {
    const getUser = UserModel.findById(data.id)
    if (!getUser) {
        throw new Error('User does not exist')
    }
}).transform(async (data) => {
    return {
        ...data,
        user : await UserModel.findById(data.id)
    }
})

export type UserCheckDTO = z.infer<typeof UserCheckZodSchema>