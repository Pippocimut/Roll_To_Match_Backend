import mongoose, { get } from "mongoose";
import { CampaignModel, PersistedCampaign } from "../database_models/Campaign";
import { CreateCampaignDTO, CreateCampaignZodSchema } from "../dto/CreateCampaignDTO";
import { SearchCampaignDTO } from "../dto/SearchCampaignDTO";
import { UpdateCampaignDTO } from "../dto/UpdateCampaignDTO";
import { UserCheckDTO, UserCheckZodSchema } from "../dto/UserCheckDTO";
import { MongoDocument } from "../types";
import { describe, it } from "@jest/globals";
import 'dotenv/config';
import { RoomModel } from "../database_models/Room";
import { UserModel } from "../database_models/User";
import { CampaignService } from "./CampaignService";

const { ObjectId, DocumentArray } = require('mongoose').Types;
/* 
export interface ICampaignService {
    createCampaign(campaignDTO: CreateCampaignDTO, user: UserCheckDTO): Promise<MongoDocument<PersistedCampaign>>;
    getCampaigns(searchParamsDTO: SearchCampaignDTO): Promise<MongoDocument<PersistedCampaign>[]>;
    getCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>>
    updateCampaign(campaignId: string, campaignDTO: UpdateCampaignDTO): Promise<MongoDocument<PersistedCampaign>>
    deleteCampaign(campaignId: string): Promise<MongoDocument<PersistedCampaign>>
}

export class CampaignService implements ICampaignService {

    public constructor() { }

    public async createCampaign(campaignDTO: CreateCampaignDTO, userCheckDTO: UserCheckDTO): Promise<MongoDocument<PersistedCampaign>> {
        const campaign: PersistedCampaign = {
            title: campaignDTO.title,
            description: campaignDTO.description,
            owner: new ObjectId(userCheckDTO.user),
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

        const campaignCreated = await CampaignModel.create(campaign);
        return campaignCreated;
    }

    public async getCampaigns(searchParamsDTO: SearchCampaignDTO, userId?: string): Promise<MongoDocument<PersistedCampaign>[]> {
        const pipeline = []

        const filter = {
            owner : userId? new ObjectId(userId) : undefined,
            tags : searchParamsDTO.filter.tags? { $in: searchParamsDTO.filter.tags } : undefined,
            location : searchParamsDTO.customFilter.myLocation? {
                $geoWithin: {
                    $centerSphere: [[searchParamsDTO.customFilter.myLocation.lng, searchParamsDTO.customFilter.myLocation.lat], searchParamsDTO.customFilter.myLocation.radius / 3963.2]
                }
            } : undefined,
            true: true
        }

        if (Object.keys(filter).length > 0) {
            pipeline.push({ $match: filter })
        }

        if (searchParamsDTO.customFilter.myLocation) {
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

        const sort = {
            distance: searchParamsDTO.sortBy.includes('location')? 1 : undefined,
            title: searchParamsDTO.sortBy.includes('title')? 1 : undefined,
            registeredAt: searchParamsDTO.sortBy.includes('registeredAt')? 1 : undefined,
            _id : 1
        }

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
} */

describe('CampaignService', () => {
    describe('integration tests', () => {
        const service = new CampaignService();

        describe('when creating a campaign', () => {
            describe('and the data is valid', () => {
                it('should create a campaign', async () => {
                    const dto = getCreateCampaignDTO({})
                    jest.spyOn(CampaignModel, 'create').mockImplementationOnce(() => Promise.resolve(getCampaign({}) as any));

                    const campaign = await service.createCampaign(dto, { user: new ObjectId() } as UserCheckDTO);
                })
            })
            describe('and the data is invalid', () => {
                it('should throw an error database validation fails', async () => {
                    const dto = getCreateCampaignDTO({})

                    jest.spyOn(CampaignModel, 'create').mockImplementationOnce(() => { throw new Error() });

                    try {
                        const campaign = await service.createCampaign(dto, { id: new ObjectId("").toString() } as UserCheckDTO);
                    } catch (error) {
                        return
                    }
                    throw new Error();
                })

            })
        })
    })
});

function getCreateCampaignDTO(createCampaignDTO: Partial<CreateCampaignDTO>): CreateCampaignDTO {
    return {
        title: "title",
        description: "description",
        location: {
            lat: 0,
            lng: 0
        },
        tags: ["tag1", "tag2", "tag3"],
        room: new ObjectId(),
        ...createCampaignDTO
    }
}

function getCampaign(campaign: Partial<PersistedCampaign>): PersistedCampaign {
    return {
        title: "title",
        description: "description",
        location: {
            type: "Point",
            coordinates: [0, 0]
        },
        tags: ["tag1", "tag2", "tag3"],
        registeredAt: new Date(),
        playerQueue: new DocumentArray([]),
        activePlayers: new DocumentArray([]),
        reviews: new DocumentArray([]),
        owner: new ObjectId(),
        room: new ObjectId(),
        ...campaign
    }
}