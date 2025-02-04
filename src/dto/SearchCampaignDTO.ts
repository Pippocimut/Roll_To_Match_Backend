import { z } from 'zod'

export const SearchCampaignZodSchema = z.object({
    filter: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        playerQueue: z.array(z.string()).optional(),
        activePlayers: z.array(z.string()).optional(),
    }).optional(),
    customFilter: z.object({
        myCampaign: z.boolean().optional(),
        myLocation: z.object({
            lat: z.number(),
            lng: z.number(),
            radius: z.number().default(10000)
        }).optional(),
        registeredBefore: z.date().optional(),
        registeredAfter: z.date().optional(),
        averageRating: z.object({
            min: z.number().optional(),
            max: z.number().optional()
        }).optional(),
    }).optional(),
    sortBy: z.array(z.enum(['title', 'registeredAt', 'location'])).optional(),
    limit: z.number().optional(),
}).refine(data => {
    if (data.sortBy && data.sortBy.includes("location") && !data.customFilter?.myLocation) {
        return false
    }
    return true
})

export type SearchCampaignDTO = z.infer<typeof SearchCampaignZodSchema>