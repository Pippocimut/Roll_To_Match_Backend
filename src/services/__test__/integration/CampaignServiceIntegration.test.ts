import mongoose from "mongoose";
import { SearchCampaignDTO, UpdateCampaignDTO } from "@roll-to-match/dto";
import { RoomModel, UserModel, CampaignModel } from "@roll-to-match/models";
import { CampaignService } from "@roll-to-match/services";
import { CampaignTags } from "@roll-to-match/types";
import { describe, it } from "@jest/globals";
import { getCreateCampaignDTO } from "@roll-to-match/dto-test/mock/MockCreateCampaignDTO"
import { getMockCampaign } from "@roll-to-match/models-test/mock/MockCampaign";
import 'dotenv/config';

const { ObjectId } = require('mongoose').Types;

const databaseName = "roll-to-match-test";

describe('CampaignService', () => {
    describe('integration tests', () => {
        const service = new CampaignService(CampaignModel);
        beforeAll(async () => {
            await mongoose.connect(process.env.BARE_MONGO_URL, {
                user: process.env.MONGO_USER,
                pass: process.env.MONGO_PASS,
                dbName: databaseName,
            })
        })

        describe('when creating a campaign', () => {
            describe('and the data is valid', () => {
                it('should create a campaign', async () => {
                    const room = await RoomModel.find({}).limit(1);
                    const user = await UserModel.findOne(room[0].owner);
                    const dto = getCreateCampaignDTO({ room: room[0]._id.toString() })

                    const campaignsInRoom = await RoomModel.deleteMany({ room: room[0]._id })

                    const campaign = await service.createCampaign(dto, user._id.toString());
                })
            })
            describe('and the data is invalid', () => {
                it('should throw an error database validation fails', async () => {
                    const dto = getCreateCampaignDTO({ tags: ["invalid invalid" as CampaignTags] })

                    try {
                        const campaign = await service.createCampaign(dto, new ObjectId().toString());
                    } catch (error) {
                        return
                    }
                    throw new Error();
                })

            })
        })
        describe('when getting campaigns', () => {
            beforeAll(async () => {
            })
            it('should return a list of campaigns', async () => {
                const searchParamsDTO: SearchCampaignDTO = {
                    filter: {
                        tags: [CampaignTags.DND, CampaignTags.BOARDGAMES]
                    },
                    customFilter: {
                        myLocation: {
                            lat: 0,
                            lng: 0,
                            radius: 1000
                        }
                    },
                    sortBy: ["location"],
                    limit: 10
                }


                const createCampaign = await CampaignModel.create(getMockCampaign({
                    tags: searchParamsDTO.filter.tags,
                    location: {
                        type: "Point",
                        coordinates: [searchParamsDTO.customFilter.myLocation.lat, searchParamsDTO.customFilter.myLocation.lng]
                    }
                }))

                const campaigns = await service.getCampaigns(searchParamsDTO);

                expect(campaigns).toBeDefined();
                expect(campaigns.length).toBeGreaterThanOrEqual(0);
                expect(campaigns.length).toBeLessThanOrEqual(10);

                await CampaignModel.deleteOne({ _id: createCampaign._id.toString() })
            })
            it('should return a list of campaigns without a DTO', async () => {
                const createCampaign = await CampaignModel.create(getMockCampaign({}))
                const campaigns = await service.getCampaigns({});

                expect(campaigns).toBeDefined();
                expect(campaigns.length).toBeGreaterThanOrEqual(1);

                await CampaignModel.deleteOne({ _id: createCampaign._id.toString() })
            });
        })

        describe('when getting a campaign', () => {
            it('should return a campaign', async () => {
                const campaigns = await CampaignModel.find({}).limit(1);
                const campaign = await service.getCampaign(campaigns[0]._id.toString());

                expect(campaign).toBeDefined();
            })
            it('should return an error if the campaign is not found', async () => {
                const campaigns = await CampaignModel.find({}).limit(1);
                await CampaignModel.deleteOne({ _id: campaigns[0]._id.toString() })

                const campaign = await service.getCampaign(campaigns[0]._id.toString());

                const createCampaignAgain = getMockCampaign(campaigns[0])
                await CampaignModel.create(createCampaignAgain)

            })
        })

        describe('when updating a campaign', () => {
            it('should update a campaign', async () => {
                const campaign = getMockCampaign({ title: "scooby doo" })
                const createdCampaign = await CampaignModel.create(campaign)

                const updateDTO: UpdateCampaignDTO = {
                    title: "new title",
                }

                const updatedCampaign = await service.updateCampaign(createdCampaign._id.toString(), updateDTO);

                expect(updatedCampaign).toBeDefined();
                expect(updatedCampaign.title).toBe("new title");

                await CampaignModel.deleteOne({ _id: createdCampaign._id.toString() })
            })
        })

        describe('when delete a campaign', () => {
            it('should delete a campaign a campaign', async () => {
                const campaign = getMockCampaign()
                const createdCampaign = await CampaignModel.create(campaign)

                expect(createdCampaign).toBeDefined()

                await service.deleteCampaign(createdCampaign._id.toString());

                const getCampaign = await CampaignModel.findById(createdCampaign._id.toString())
                expect(getCampaign).toBeNull()
            })
        })
    })

    afterAll(async () => {
        await mongoose.connection.close();
    });
});