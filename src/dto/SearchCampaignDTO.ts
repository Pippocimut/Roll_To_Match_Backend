import {z} from 'zod'
import {Days, Frequencies, Games} from "@roll-to-match/types";

export const SearchCampaignZodSchema = z.object({
    lat: z.string().transform((val) => Number(val) || 0).optional(),
    lng: z.string().transform((val) => Number(val) || 0).optional(),
    radius: z.string().default("1000").transform((val) => Number(val)),
    searchString: z.string().optional(),
    owner: z.string().optional(),
    pending: z.string().optional(),
    participant: z.string().optional(),
    sortBy: z.array(z.enum(['title', 'registeredAt', 'location'])).optional(),
    limit: z.string().default("9").transform((val) => {
        const valNum = Number(val);
        if (isNaN(valNum)) {
            return 9;
        }
        return valNum
    }),
    page: z.string().default("1").transform((val) => {
        const valNum = Number(val);
        if (isNaN(valNum)) {
            return 1;
        }
        return valNum
    }),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    price: z.string().transform(parseFloat).optional(),
    time: z.string().optional(),
    seatsLeft: z.string().transform(z => parseInt(z) || 1).optional(),
    game: z.nativeEnum(Games).optional(),
    days: z.string().transform(val => val.split(',').map(day => day.trim() as Days)).optional(),
    frequency: z.nativeEnum(Frequencies).optional(),
}).passthrough()

export type SearchCampaignDTO = z.infer<typeof SearchCampaignZodSchema>