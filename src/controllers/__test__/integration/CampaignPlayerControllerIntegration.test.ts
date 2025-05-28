import {CampaignPlayerController} from "../../CampaignPlayerController";
import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose, {Types} from "mongoose";
import {CampaignModel, UserModel} from "@roll-to-match/models";
import {getMockUser} from "@roll-to-match/models-test/mock/MockUser";
import {getMockCampaign} from "@roll-to-match/models-test/mock/MockCampaign";

const {ObjectId} = Types

const createMockRes = () => ({
    status: jest.fn().mockReturnValue({
        json: jest.fn(),
    }),
} as any);

const createMockReq = (parameters?: { params?: any, user?: any }) => ({
    params: parameters?.params,
    user: parameters?.user,
} as any);

const next = jest.fn();

describe("CampaignPlayerController", () => {
    let controller: CampaignPlayerController;
    let mongod;

    beforeAll(async () => {
        controller = CampaignPlayerController.getInstance()
        mongod = await MongoMemoryServer.create()
        const uri = await mongod.getUri()

        await mongoose.connect(uri, {})
    })

    describe("When joining a campaign", () => {
        describe("And the user is unauthenticated", () => {
            it('should throw an error', async () => {
                const req = createMockReq();
                const res = createMockRes();

                await controller.createPlayer(req, res, next);

                expect(res.status).toHaveBeenCalledWith(401);
            })

        });

        describe("And the player doesnt exist", () => {
            it('should throw an error', async () => {
                const req = createMockReq({
                    user: {},
                    params: {
                        campaignId: new ObjectId().toString(),
                        playerId: new ObjectId().toString()
                    }
                });

                console.log(req)

                const res = createMockRes();

                await controller.createPlayer(req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
            })


        });

        describe('And the campaign doesnt exist', () => {
            it('should throw an error', async () => {
                const user = await UserModel.create(getMockUser());
                const req = createMockReq({
                    user: {},
                    params: {
                        campaignId: new ObjectId().toString(),
                        playerId: user._id.toString()
                    }
                })

                const res = createMockRes();

                await controller.createPlayer(req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
            })
        });

        describe("And everything works as intended", () => {
            describe("And the player is already in the campaign", () => {
                it('should throw an error', async () => {
                    const user = await UserModel.create(getMockUser());
                    const campaign = await CampaignModel.create(getMockCampaign({
                        activePlayers: [user]
                    }))

                    const req = createMockReq({
                        user: user,
                        params: {
                            campaignId: campaign._id.toString(),
                            playerId: user._id.toString()
                        }
                    })

                    const res = createMockRes();

                    await controller.createPlayer(req, res, next);

                    expect(res.status).toHaveBeenCalledWith(401);
                })
            })
            describe("And the player is not in the campaign", () => {
                describe("But the player is the owner of the campaign", () => {
                    it("should return bad request", async () => {
                        const user = await UserModel.create(getMockUser());
                        const campaign = await CampaignModel.create(getMockCampaign({
                            owner: user._id
                        }))

                        const req = createMockReq({
                            user: user,
                            params: {
                                campaignId: campaign._id.toString(),
                                playerId: user._id.toString()
                            }
                        })

                        const res = createMockRes();

                        await controller.createPlayer(req, res, next);

                        expect(res.status).toHaveBeenCalledWith(400);
                    })
                })
                describe("And the player is not the owner of the campaign", () => {
                    describe("But the player is not in the queue of the campaign", () => {
                        it("Should throw a bad request error response", async () => {
                            const user = await UserModel.create(getMockUser());
                            const player = await UserModel.create(getMockUser());
                            const campaign = await CampaignModel.create(getMockCampaign({
                                owner: user._id
                            }))

                            const req = createMockReq({
                                user: user,
                                params: {
                                    campaignId: campaign._id.toString(),
                                    playerId: player._id.toString()
                                }
                            })

                            const res = createMockRes();

                            await controller.createPlayer(req, res, next);

                            expect(res.status).toHaveBeenCalledWith(400);
                        })
                    })
                    describe("And the player is in the queue of the campaign", () => {
                        describe("But the campaign is full", () => {
                            it("Should throw a bad request error", async () => {
                                const user = await UserModel.create(getMockUser());
                                const player = await UserModel.create(getMockUser());
                                const campaign = await CampaignModel.create(getMockCampaign({
                                    owner: user._id,
                                    playerQueue: [player],
                                    maxSeats: 0
                                }))

                                const req = createMockReq({
                                    user: user,
                                    params: {
                                        campaignId: campaign._id.toString(),
                                        playerId: player._id.toString()
                                    }
                                })

                                const res = createMockRes();

                                await controller.createPlayer(req, res, next);

                                const campaign2 = await CampaignModel.findOne({_id: campaign._id})
                                if (!campaign2) throw new Error(
                                    "Campaign not found"
                                )

                                expect(res.status).toHaveBeenCalledWith(400);
                            })
                        })
                        it("Should make the player join the campaign without throwing errors", async () => {
                            const user = await UserModel.create(getMockUser());
                            const player = await UserModel.create(getMockUser());
                            const campaign = await CampaignModel.create(getMockCampaign({
                                owner: user._id,
                                playerQueue: [player],
                                activePlayers: [],
                                maxSeats: 4
                            }))

                            const req = createMockReq({
                                user: user,
                                params: {
                                    campaignId: campaign._id.toString(),
                                    playerId: player._id.toString()
                                }
                            })

                            const res = createMockRes();

                            await controller.createPlayer(req, res, next);

                            const campaign2 = await CampaignModel.findOne({_id: campaign._id})
                            if (!campaign2) throw new Error(
                                "Campaign not found"
                            )

                            expect(res.status).toHaveBeenCalledWith(201);
                            expect(campaign2.activePlayers.map(player => player._id)).toContainEqual(player._id)
                        })
                    })
                })
            })
        });
    })

    describe("When kicking a player out of a campaign", () => {
        describe("And the user is unauthenticated", () => {
            it('should throw an error', async () => {
                const req = createMockReq()
                const res = createMockRes();

                await controller.kickPlayer(req, res, next);

                expect(res.status).toHaveBeenCalledWith(401);
            })
        });

        describe("And the player doesnt exist", () => {
            it('should throw an error', async () => {
                const req = createMockReq({
                    user: {},
                    params: {
                        campaignId: new ObjectId().toString(),
                        playerId: new ObjectId().toString()
                    }
                })

                const res = createMockRes();

                await controller.kickPlayer(req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
            })
        });

        describe('And the campaign doesnt exist', () => {
            it('should throw an error', async () => {
                const user = await UserModel.create(getMockUser());
                const req = createMockReq({
                    user: {},
                    params: {
                        campaignId: new ObjectId().toString(),
                        playerId: user._id.toString()
                    }
                })

                const res = createMockRes();

                await controller.kickPlayer(req, res, next);

                expect(res.status).toHaveBeenCalledWith(404);
            })
        });

        describe("And the user is not the owner of the campaign", () => {
            it("Should return an unauthorized error", async () => {
                const user = await UserModel.create(getMockUser());
                const campaign = await CampaignModel.create(getMockCampaign({
                    activePlayers: [],
                    owner: new ObjectId()
                }))

                const req = createMockReq({
                    user: user,
                    params: {
                        campaignId: campaign._id.toString(),
                        playerId: user._id.toString()
                    }
                })

                const res = createMockRes();

                await controller.kickPlayer(req, res, next);

                expect(res.status).toHaveBeenCalledWith(401);

            })
        })

        describe("And the user is the owner of the campaign", () => {
            describe("And the player is not in the campaign", () => {
                it('should throw an error', async () => {
                    const user = await UserModel.create(getMockUser());
                    const player = await UserModel.create(getMockUser());
                    const campaign = await CampaignModel.create(getMockCampaign({
                        activePlayers: [],
                        owner: user._id
                    }))

                    const req = createMockReq({
                        user: user,
                        params: {
                            campaignId: campaign._id.toString(),
                            playerId: player._id.toString()
                        }
                    })

                    const res = createMockRes();

                    await controller.kickPlayer(req, res, next);

                    expect(res.status).toHaveBeenCalledWith(404);
                })
            })
            describe("And the player is in the campaign", () => {
                it('Remove the player without returning errors', async () => {
                    const user = await UserModel.create(getMockUser());
                    const player = await UserModel.create(getMockUser());
                    const campaign = await CampaignModel.create(getMockCampaign({
                        activePlayers: [player],
                        owner: user._id
                    }))

                    const req = createMockReq({
                        user: user,
                        params: {
                            campaignId: campaign._id.toString(),
                            playerId: player._id.toString()
                        }
                    })

                    const res = createMockRes();

                    await controller.kickPlayer(req, res, next);

                    const campaingUpdated = await CampaignModel.findOne({
                        _id: campaign._id
                    })
                    if (!campaingUpdated) throw new Error(
                        "Campaign not found"
                    )

                    expect(res.status).toHaveBeenCalledWith(200);
                    expect(campaingUpdated.activePlayers).toEqual([])
                })
            })
        });
    })

    afterEach(async () => {
        CampaignModel.deleteMany({})
        UserModel.deleteMany({})
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })
})


