import { z } from 'zod'

export const CreateRoomZodSchema = z.object({
    title: z.string().min(1).max(255),
})

export type CreateRoomDTO = z.infer<typeof CreateRoomZodSchema>