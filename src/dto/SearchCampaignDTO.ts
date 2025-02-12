import { name } from 'ejs'
import { z } from 'zod'

export const SearchCampaignZodSchema = z.object({
    lat: z.string().transform((val) => Number(val) || 0).optional(),
    lng: z.string().transform((val) => Number(val) || 0).optional(),
    radius: z.string().default("1000").transform((val) => Number(val)),
    searchString: z.string().optional(),
    sortBy: z.array(z.enum(['title', 'registeredAt', 'location'])).optional(),
    limit: z.number().optional(),
}).passthrough()

export type SearchCampaignDTO = z.infer<typeof SearchCampaignZodSchema>