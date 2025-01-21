import { z } from 'zod'

export const CreateCandidateZodSchema = z.object({
    slug: z.string(),
    email: z.string().email(),
    id: z.string().optional()
})

export type CreateCandidateDTO = z.infer<typeof CreateCandidateZodSchema>