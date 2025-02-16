import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { CreateCampaignDTO } from "../dto/CreateCampaignDTO";
import { UpdateCampaignDTO } from "../dto/UpdateCampaignDTO";
import { MongoDocument } from "../data-types";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export type CampaignSearchParams = {
    /* limit?: number;
    sortBy?: string[]; */
    lat?: number;
    lng?: number;
    radius: number;
    searchString?: string;
    owner?: string;
    /* filter?: {
        room?: string;
        owner?: string;
        tags?: string[];
    } */
}

export interface ICampaignService {
    createCampaign(campaignDTO: CreateCampaignDTO, roomId: string, ownerId: string): Promise<MongoDocument<PersistedCampaign>>;
    getCampaigns(searchParamsDTO: CampaignSearchParams): Promise<MongoDocument<PersistedCampaign>[]>;
    getCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>>
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
            coordinates: [campaignDTO.location?.lat || 0, campaignDTO.location?.lng || 0]
        }

        const tags = campaignDTO.tags || [];

        const campaign: PersistedCampaign = {
            title: campaignDTO.title,
            description: campaignDTO.description,
            owner: new ObjectId(ownerId),
            room: new ObjectId(roomId),
            location: location,
            tags: tags,
            registeredAt: new Date(),
            reviews: new DocumentArray([]),
            playerQueue: new DocumentArray([]),
            game: campaignDTO.game,
            activePlayers: new DocumentArray([]),
        }

        const campaignCreated = await this.campaignModel.create(campaign);
        return campaignCreated;
    }

    public async getCampaigns(searchParamsDTO: CampaignSearchParams, userId?: string): Promise<MongoDocument<PersistedCampaign>[]> {
        const pipeline: any = []

        /* if (searchParamsDTO.customFilter && searchParamsDTO.customFilter.myLocation) {
            pipeline.push({
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [searchParamsDTO.customFilter.myLocation.lng, searchParamsDTO.customFilter.myLocation.lat]
                    },
                    distanceField: "distance",
                    spherical: true
                }
            })
        } */

        const filter = {}

        /* if (searchParamsDTO.filter) {
            if (searchParamsDTO.filter.tags) {
                pipeline.push({
                    $match: {
                        tags: { $in: searchParamsDTO.filter.tags }
                    }
                })
            }
            if (searchParamsDTO.filter.owner) {
                filter["owner"] = new ObjectId(searchParamsDTO.filter.owner)
            }
            if (searchParamsDTO.filter.room) {
                filter["room"] = new ObjectId(searchParamsDTO.filter.room)
            }
        } */

        const EARTH_RADIUS_KM = 6371;

        if (searchParamsDTO.owner) {
            filter["owner"] = new ObjectId(searchParamsDTO.owner)
        }

        if (searchParamsDTO.searchString) {
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: searchParamsDTO.searchString, $options: 'i' } },
                        { description: { $regex: searchParamsDTO.searchString, $options: 'i' } }
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

        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter })
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
            pipeline.push({ $sort: sort })
        }

        /* if (searchParamsDTO.limit) {
            pipeline.push({ $limit: searchParamsDTO.limit })
        } */

        let campaigns = await CampaignModel.aggregate(pipeline).exec()

        return campaigns;
    }

    public async getCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>> {
        const campaign = await CampaignModel.findById(campaignId);
        if (!campaign || campaign === null) {
            throw new Error('Campaign not found');
        }
        return campaign;
    }

    public async updateCampaign(campaignId: string, campaignDTO: UpdateCampaignDTO): Promise<MongoDocument<PersistedCampaign>> {
        const updatedCampaign = await CampaignModel.findByIdAndUpdate(campaignId, campaignDTO, { new: true });
        if (!updatedCampaign || updatedCampaign === null) {
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