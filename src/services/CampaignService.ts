import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { CreateCampaignDTO } from "../dto/CreateCampaignDTO";
import { SearchCampaignDTO } from "../dto/SearchCampaignDTO";
import { UpdateCampaignDTO } from "../dto/UpdateCampaignDTO";
import { UserCheckDTO, UserCheckZodSchema } from "../dto/UserCheckDTO";
import { MongoDocument } from "../data-types";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export interface ICampaignService {
    createCampaign(campaignDTO: CreateCampaignDTO, user: UserCheckDTO): Promise<MongoDocument<PersistedCampaign>>;
    getCampaigns(searchParamsDTO: SearchCampaignDTO): Promise<MongoDocument<PersistedCampaign>[]>;
    getCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>>
    updateCampaign(campaignId: string, campaignDTO: UpdateCampaignDTO): Promise<MongoDocument<PersistedCampaign>>
    deleteCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>>
}

export class CampaignService implements ICampaignService {

    private campaignModel: typeof CampaignModel;

    public constructor(campaignModel: typeof CampaignModel) {
        this.campaignModel = campaignModel;
    }

    public async createCampaign(campaignDTO: CreateCampaignDTO, userCheckDTO: UserCheckDTO): Promise<MongoDocument<PersistedCampaign>> {
        const campaign: PersistedCampaign = {
            title: campaignDTO.title,
            description: campaignDTO.description,
            owner: new ObjectId(userCheckDTO.id),
            room: new ObjectId(campaignDTO.room),
            location: {
                type: "Point",
                coordinates: [campaignDTO.location.lat, campaignDTO.location.lng]
            },
            tags: campaignDTO.tags,
            registeredAt: new Date(),
            reviews: new DocumentArray([]),
            playerQueue: new DocumentArray([]),
            activePlayers: new DocumentArray([]),
        }

        const campaignCreated = await this.campaignModel.create(campaign);
        return campaignCreated;
    }

    public async getCampaigns(searchParamsDTO: SearchCampaignDTO, userId?: string): Promise<MongoDocument<PersistedCampaign>[]> {
        const pipeline = []

        if (searchParamsDTO.customFilter && searchParamsDTO.customFilter.myLocation) {
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
        }

        const filter = {}

        if (searchParamsDTO.filter) {
            if (searchParamsDTO.filter.tags) {
                pipeline.push({
                    $match: {
                        tags: { $in: searchParamsDTO.filter.tags }
                    }
                })
            }
        }
        if (searchParamsDTO.customFilter) {
            if (searchParamsDTO.customFilter.myLocation) {
                pipeline.push({
                    $match: {
                        location: {
                            $geoWithin: {
                                $centerSphere: [[searchParamsDTO.customFilter.myLocation.lng, searchParamsDTO.customFilter.myLocation.lat], searchParamsDTO.customFilter.myLocation.radius / 3963.2]
                            }
                        }
                    }
                })
            }
        }

        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter })
        }

        const sort: any = {};
        if (searchParamsDTO.sortBy) {
            if (searchParamsDTO.sortBy.includes('location')) {
                sort["distance"] = 1;
            }
            if (searchParamsDTO.sortBy.includes('title')) {
                sort["title"] = 1;
            }
            if (searchParamsDTO.sortBy.includes('registeredAt')) {
                sort["registeredAt"] = 1;
            }
        }
        sort["_id"] = 1; // Always include _id to ensure a consistent sort order

        if (Object.keys(sort).length > 0) {
            pipeline.push({ $sort: sort })
        }

        if (searchParamsDTO.limit) {
            pipeline.push({ $limit: searchParamsDTO.limit })
        }

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
        return updatedCampaign;
    }

    public async deleteCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>> {
        const deleted = await CampaignModel.findByIdAndDelete(campaignId);
        return deleted;
    }
}