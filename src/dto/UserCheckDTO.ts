import { z } from 'zod'
import { UserModel } from '../database-models/User'
export const UserCheckZodSchema = z.object({
    id: z.string(),
}).refine(async data => {
    const getUser = await UserModel.findById(data.id.toString())
    console.log(getUser)
    if (!getUser) {
        return false
    }
    return true
}, "User does not exist").transform(async (data) => {
    return {
        ...data,
        user: await UserModel.findById(data.id)
    }
})

export type UserCheckDTO = z.infer<typeof UserCheckZodSchema>