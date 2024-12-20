import { z } from 'zod'

export const CreateRoomZodSchema = z.object({})

export type CreateRoomDTO = z.infer<typeof CreateRoomZodSchema>