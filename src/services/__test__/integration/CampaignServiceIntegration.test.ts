import mongoose from "mongoose";
import {SearchCampaignDTO, SearchCampaignZodSchema, UpdateCampaignDTO} from "@roll-to-match/dto";
import {RoomModel, UserModel, CampaignModel, PersistedCampaign} from "@roll-to-match/models";
import {CampaignService} from "@roll-to-match/services";
import {describe, it} from "@jest/globals";
import {getCreateCampaignDTO} from "@roll-to-match/dto-test/mock/MockCreateCampaignDTO"
import {getMockCampaign} from "@roll-to-match/models-test/mock/MockCampaign";
import 'dotenv/config';
import {CampaignTags} from "../../../data-types/campaign-tags";
import {Games} from "@roll-to-match/types";
import {MongoMemoryServer} from "mongodb-memory-server";

const {ObjectId} = require('mongoose').Types;

describe('CampaignService',() => {

    let mongod;

    describe('integration tests', () => {
        const service = new CampaignService(CampaignModel);
        beforeAll(async () => {
            mongod = await MongoMemoryServer.create()
            const mongoUri = await mongod.getUri()

            await mongoose.connect(mongoUri, {})

        })

        afterEach(async () => {
            RoomModel.deleteMany({})
            UserModel.deleteMany({})
            CampaignModel.deleteMany({})
        })

        afterAll(async () => {
            await mongoose.disconnect()
            await mongod.stop()
        })

        describe('when creating a campaign', () => {
            describe('and the data is valid', () => {
                it('should create a campaign', async () => {
                    const user = await UserModel.create({
                        email: "<EMAIL>",
                        password: "<PASSWORD>",
                        name: "test",
                        slug: "test",
                        username: "test",
                        role: "user",
                        avatar: "test",
                        googleId: "test",
                        facebookId: "test",
                        githubId: "test",
                        discordId: "test",
                    })

                    console.log(user)

                    const room = await RoomModel.create({
                        title: "Hello",
                        campaigns:[],
                        owner: user._id
                    })

                    if (!user) {
                        throw new Error('No user found');
                    }

                    const dto = getCreateCampaignDTO()

                    const campaignsInRoom = await RoomModel.deleteMany({room: room._id})

                    const campaign = await service.createCampaign(dto, room._id.toString(), user._id.toString());

                })
            })
            describe('and the data is invalid', () => {
                it('should throw an error database validation fails', async () => {
                    const dto = getCreateCampaignDTO({tags: ["invalid invalid" as CampaignTags]})

                    try {
                        const campaign = await service.createCampaign(dto, new ObjectId().toString(), new ObjectId().toString());
                    } catch (error) {
                        return
                    }
                    throw new Error();
                })

            })
        })

        describe('when getting campaigns', () => {
            it('should return a list of campaigns', async () => {
                const searchParamsDTO: SearchCampaignDTO = {
                    lat: 0,
                    lng: 0,
                    radius: 1000,
                    sortBy: ["location"],
                    limit: 10,
                    page: 1,
                }


                const location = {
                    type: "Point",
                    coordinates: [searchParamsDTO.lat || 0, searchParamsDTO.lng || 0]
                }

                const createCampaign = await CampaignModel.create(getMockCampaign({
                    location: location
                }))

                const result = await service.getCampaigns(searchParamsDTO);

                expect(result).toBeDefined();
                expect(result.campaigns.length).toBeGreaterThanOrEqual(1);
                expect(result.campaigns.length).toBeLessThanOrEqual(1);

                await CampaignModel.deleteOne({_id: createCampaign._id.toString()})
            })
            it('should return a list of campaigns without a DTO', async () => {
                const createCampaign = await CampaignModel.create(getMockCampaign({}))
                const searchParams = SearchCampaignZodSchema.parse({})
                const result = await service.getCampaigns(searchParams);

                expect(result).toBeDefined();
                expect(result.campaigns.length).toBeGreaterThanOrEqual(1);

                await CampaignModel.deleteOne({_id: createCampaign._id.toString()})
            });
        })

        describe('when getting a campaign', () => {
            it('should return a campaign', async () => {
                const campaigns = await CampaignModel.find({}).limit(1);
                const campaign = await service.getCampaign(campaigns[0]._id.toString());

                expect(campaign).toBeDefined();
            })

            it('should return null if the campaign is not found', async () => {
                const campaign = await CampaignModel.create(getMockCampaign())
                await CampaignModel.deleteOne({_id: campaign._id.toString()})
                const campaignReturned = await service.getCampaign(campaign._id.toString());
                expect(campaignReturned).toBeNull()

            })
        })

        describe('when updating a campaign', () => {
            describe('and the input is invalid', () => {

                const input: UpdateCampaignDTO[] = [
                    {
                        game: "Mock" as Games
                    }
                ]

                it.each(input)('should not change the campaign', async (dto) => {
                    const campaign = getMockCampaign({})
                    const createdCampaign = await CampaignModel.create(campaign)

                    expect(service.updateCampaign(createdCampaign._id.toString(), dto)).rejects.toThrow();

                    await CampaignModel.deleteOne({_id: createdCampaign._id.toString()})
                })
            })

            it('should update a campaign', async () => {
                const campaign = getMockCampaign({title: "scooby doo"})
                const createdCampaign = await CampaignModel.create(campaign)

                const updateDTO: UpdateCampaignDTO = {
                    title: "new title",
                }

                await service.updateCampaign(createdCampaign._id.toString(), updateDTO);
                const updatedCampaign = await CampaignModel.findById(createdCampaign._id.toString())

                expect(updatedCampaign).toBeDefined();
                expect(updatedCampaign).not.toBeNull();
                expect(updatedCampaign!.title).toBe("new title");
                expect(updatedCampaign!.description).toBe(campaign.description);

                await CampaignModel.deleteOne({_id: createdCampaign._id.toString()})
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