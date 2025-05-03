import {CampaignModel, PersistedCampaign} from "../database-models/Campaign";
import {CreateCampaignDTO} from "../dto/CreateCampaignDTO";
import {UpdateCampaignDTO} from "../dto/UpdateCampaignDTO";
import {Days, DeepPartial, Frequencies, MongoDocument} from "@roll-to-match/types";
import {z} from "zod";

const {ObjectId, DocumentArray} = require('mongoose').Types;

export type PaginatedCampaigns = {
    pagination: {
        total: number;
        limit: number;
        offset: number;
    }
    campaigns: MongoDocument<PersistedCampaign>[]
}

export type CampaignSearchParams = {
    limit: number;
    page: number;
    //sortBy?: string[];
    lat?: number;
    lng?: number;
    radius: number;
    searchString?: string;
    owner?: string;
    pending?: string,
    participant?: string,
    days?: Days[];
    timeRangeStart?: string;
    timeRangeEnd?: string;
    frequency?: Frequencies;
    game?: string;
    price?: number;
    seatsLeft?: number;
    /* filter?: {
        room?: string;
        owner?: string;
        tags?: string[];
    } */
}

export interface ICampaignService {
    createCampaign(campaignDTO: CreateCampaignDTO, image: string, roomId: string, ownerId: string): Promise<MongoDocument<PersistedCampaign>>;

    getCampaigns(searchParamsDTO: CampaignSearchParams): Promise<PaginatedCampaigns>;

    getCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign> | null>

    updateCampaign(campaignId: string, campaignDTO: UpdateCampaignDTO): Promise<MongoDocument<PersistedCampaign>>

    deleteCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>>
}

export class CampaignService implements ICampaignService {

    private campaignModel: typeof CampaignModel;

    public constructor(campaignModel: typeof CampaignModel) {
        this.campaignModel = campaignModel;
    }

    public async createCampaign(campaignDTO: CreateCampaignDTO, roomId: string, ownerId: string): Promise<MongoDocument<PersistedCampaign>> {

        const location = {
            type: "Point",
            coordinates: [campaignDTO?.latitude || 0, campaignDTO?.longitude || 0]
        }

        const tags = campaignDTO.tags || [];

        const campaign: PersistedCampaign = {
            title: campaignDTO.title,
            description: campaignDTO.description,
            owner: new ObjectId(ownerId),
            room: new ObjectId(roomId),
            locationName: campaignDTO.locationName,
            location: location,
            tags: tags,
            schedule: {
                days: campaignDTO.schedule.days as Days[],
                time: campaignDTO.schedule.time,
                frequency: campaignDTO.schedule.frequency as Frequencies,
            },
            image: campaignDTO.image || "",
            contactInfo: campaignDTO?.contactInfo,
            requirements: campaignDTO?.requirements || "",
            price: campaignDTO.price,
            languages: campaignDTO?.languages || [],
            maxSeats: campaignDTO?.maxSeats || 1,
            registeredAt: new Date(),
            reviews: new DocumentArray([]),
            playerQueue: new DocumentArray([]),
            game: campaignDTO.game,
            activePlayers: new DocumentArray([]),
        }

        return await this.campaignModel.create(campaign);
    }

    public async getCampaigns(searchParamsDTO: CampaignSearchParams, userId?: string): Promise<PaginatedCampaigns> {
        const pipeline: any = []

        const filter = {}

        const EARTH_RADIUS_KM = 6371;

        if (searchParamsDTO.owner) {
            filter["owner"] = new ObjectId(searchParamsDTO.owner)
        }

        if (searchParamsDTO.searchString) {
            pipeline.push({
                $match: {
                    $or: [
                        {title: {$regex: searchParamsDTO.searchString, $options: 'i'}},
                        {description: {$regex: searchParamsDTO.searchString, $options: 'i'}}
                    ]
                }
            })
        }

        if (searchParamsDTO.lat && searchParamsDTO.lng && searchParamsDTO.radius) {
            pipeline.push({
                $match: {
                    location: {
                        $geoWithin: {
                            $centerSphere: [[searchParamsDTO.lng, searchParamsDTO.lat], searchParamsDTO.radius / EARTH_RADIUS_KM]
                        }
                    }
                }
            })
        }

        if (searchParamsDTO.participant) {
            filter["activePlayers._id"] = new ObjectId(searchParamsDTO.participant)
        }

        if (searchParamsDTO.pending) {
            filter["playerQueue._id"] = new ObjectId(searchParamsDTO.pending)
        }

        if (searchParamsDTO.days) {
            filter["schedule.days"] = {$in: searchParamsDTO.days}
        }

        if (searchParamsDTO.timeRangeStart && searchParamsDTO.timeRangeEnd) {
            filter["schedule.time"] = {$gte: searchParamsDTO.timeRangeStart, $lte: searchParamsDTO.timeRangeEnd}
        }

        if (searchParamsDTO.frequency) {
            filter["schedule.frequency"] = searchParamsDTO.frequency
        }

        if (searchParamsDTO.game) {
            filter["game"] = searchParamsDTO.game
        }
        if (searchParamsDTO.price || searchParamsDTO.price === 0) {
            filter["price"] = {$lte: searchParamsDTO.price}
        }
        if (searchParamsDTO.owner) {
            filter["owner"] = new ObjectId(searchParamsDTO.owner)
        }

        if (Object.keys(filter).length > 0) {
            pipeline.push({$match: filter})
        }

        if (searchParamsDTO.seatsLeft) {
            console.log("seats left", searchParamsDTO.seatsLeft)
            pipeline.push({
                    $match: {
                        $expr: {
                            $gte: [
                                {$subtract: ["$maxSeats", {$size: "$activePlayers"}]},
                                searchParamsDTO.seatsLeft
                            ]
                        }
                    }
                }
            )
        }

        const sort: any = {};
        /*  if (searchParamsDTO.sortBy) {
             if (searchParamsDTO.sortBy.includes('location')) {
                 sort["distance"] = 1;
             }
             if (searchParamsDTO.sortBy.includes('title')) {
                 sort["title"] = 1;
             }
             if (searchParamsDTO.sortBy.includes('registeredAt')) {
                 sort["registeredAt"] = 1;
             }
         } */
        sort["_id"] = 1; // Always include _id to ensure a consistent sort order

        if (Object.keys(sort).length > 0) {
            pipeline.push({$sort: sort})
        }

        const totalCount = await CampaignModel.countDocuments(filter);

        if (searchParamsDTO.page) {
            pipeline.push({$skip: (searchParamsDTO.page - 1) * searchParamsDTO.limit})
        }

        if (searchParamsDTO.limit) {
            pipeline.push({$limit: searchParamsDTO.limit})
        }
        return {
            pagination: {
                total: totalCount,
                limit: searchParamsDTO.limit,
                offset: (searchParamsDTO.page - 1) * searchParamsDTO.limit,
            },
            campaigns: await CampaignModel.aggregate(pipeline).exec()
        }
    }

    public async getCampaign(campaignId: string):
        Promise<MongoDocument<PersistedCampaign> | null> {
        return await CampaignModel.findById(campaignId);
    }

    public async updateCampaign(campaignId: string, campaignDTO: UpdateCampaignDTO):
        Promise<MongoDocument<PersistedCampaign>> {
        const location = campaignDTO?.latitude && campaignDTO?.longitude ? {
            type: "Point",
            coordinates: [campaignDTO?.latitude || 0, campaignDTO?.longitude || 0]
        } : undefined;

        const tags = campaignDTO.tags || undefined;

        const campaignUpdate: DeepPartial<PersistedCampaign> = {
            title: campaignDTO.title,
            description: campaignDTO.description,
            location: location,
            tags: tags,
            schedule: {
                days: campaignDTO?.schedule?.days as Days[],
                time: campaignDTO?.schedule?.time,
                frequency: campaignDTO?.schedule?.frequency as Frequencies,
            },
            requirements: campaignDTO?.requirements,
            price: campaignDTO?.price,
            languages: campaignDTO?.languages,
            maxSeats: campaignDTO?.maxSeats,
            game: campaignDTO?.game,
        }

        const updatedCampaign = await CampaignModel.findByIdAndUpdate(campaignId, campaignUpdate);
        if (!updatedCampaign) {
            throw new Error('Campaign not found');
        }
        return updatedCampaign;
    }

    public async deleteCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>> {
        const deleted = await CampaignModel.findByIdAndDelete(campaignId);
        if (!deleted || deleted === null) {
            throw new Error('Campaign not found');
        }
        return deleted;
    }
}