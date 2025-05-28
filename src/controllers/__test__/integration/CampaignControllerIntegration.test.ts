import {CampaignController} from "../../CampaignController";
import {CampaignModel, RoomModel, UserModel} from "@roll-to-match/models";
import mongoose, {Types} from "mongoose";
import {MongoMemoryServer} from "mongodb-memory-server";
import {getMockCampaign} from "@roll-to-match/models-test/mock/MockCampaign";
import {getMockUser} from "@roll-to-match/models-test/mock/MockUser";

const {ObjectId} = Types

const createMockRes = () => ({
    status: jest.fn().mockReturnValue({
        json: jest.fn(),
    }),
} as any);

const createMockReq = (parameters?: { params?: any, user?: any, body?: any, query?: any }) => ({
    params: parameters?.params,
    user: parameters?.user,
    body: parameters?.body,
    query: parameters?.query
} as any);

const next = jest.fn();

describe("CampaignController", () => {
    let controller: CampaignController;
    let mongod;

    beforeAll(async () => {
        controller = CampaignController.getInstance()
        mongod = await MongoMemoryServer.create()
        const uri = await mongod.getUri()

        await mongoose.connect(uri, {})
    })

    describe("When creating a campaign", () => {
        describe("And the user is unauthenticated", () => {
            it('should throw an error', async () => {
                const req = createMockReq();
                const res = createMockRes();

                await controller.createCampaign(req, res)
                expect(res.status).toHaveBeenCalledWith(401);

            })
        })

        describe("And the user is authenticated", () => {
            describe('and the data is invalid', () => {
                it("should return a 400 error", async () => {
                    const user = await UserModel.create(getMockUser());

                    const req = createMockReq({
                        user: user,
                        body: {}
                    })

                    const res = createMockRes();

                    await controller.createCampaign(req, res)

                    expect(res.status).toHaveBeenCalledWith(400);
                })
            });
            describe("And the data is valid", () => {
                it("should create a campaign", async () => {
                    const user = await UserModel.create(getMockUser());

                    const req = createMockReq({
                        user: user,
                        body: getMockCampaign()
                    })

                    const res = createMockRes();

                    await controller.createCampaign(req, res)

                    expect(res.status).toHaveBeenCalledWith(201);
                })
            })
        })
    })

    describe("When getting a campaign", () => {
        describe("And the campaign exists", () => {
            it("should return a campaign ", async () => {
                const user = await UserModel.create(getMockUser());
                const campaign = await CampaignModel.create(getMockCampaign({
                    owner: user._id
                }))

                const req = createMockReq({
                    params: {
                        id: campaign._id.toString()
                    }
                })

                const res = createMockRes();

                await controller.getCampaign(req, res)

                expect(res.status).toBeCalledWith(200)

            })
        })
        describe("And the campaign doesnt exist", () => {
            it("should return a 404 error", async () => {

                const req = createMockReq({
                    params: {
                        id: new ObjectId().toString()
                    }
                })

                const res = createMockRes();

                await controller.getCampaign(req, res)

                expect(res.status).toBeCalledWith(404)

            })
        })
    })

    describe("When getting all campaigns", () => {
        describe("and giving no filter", () => {
            it("should return all campaigns", async () => {
                const user = await UserModel.create(getMockUser());
                const campaign = await CampaignModel.create(getMockCampaign({
                    owner: user._id
                }))
                const campaign2 = await CampaignModel.create(getMockCampaign({
                    owner: user._id
                }))

                const req = createMockReq({query: {}})
                const res = createMockRes();

                await controller.getCampaigns(req, res)

                expect(res.status).toBeCalledWith(200)
                expect(res.status().json).toBeCalledWith(expect.objectContaining({
                    campaigns: expect.arrayContaining([
                        expect.objectContaining({id: campaign._id.toString()}),
                        expect.objectContaining({id: campaign2._id.toString()})
                    ])
                }))

            })
        })
        describe("and giving a filter", () => {
            describe("and the filter is for pagination", () => {
                it("Should return only the pages specified in pagination", async () => {
                    const user = await UserModel.create(getMockUser());
                    const campaign = await CampaignModel.create(getMockCampaign({
                        owner: user._id
                    }))
                    const campaign2 = await CampaignModel.create(getMockCampaign({
                        owner: user._id
                    }))

                    const req = createMockReq({
                        query: {
                            page: "1",
                            limit: "1",
                        }
                    })
                    const res = createMockRes();

                    await controller.getCampaigns(req, res)

                    expect(res.status).toBeCalledWith(200)
                    const actualJson = res.status().json.mock.calls[0][0]; // Get the JSON response object
                    expect(actualJson.campaigns).toHaveLength(1);

                })
            })

            describe("and the filter is for specific fields", () => {
                it("Should return only the fields specified in the filter", async () => {
                    const user = await UserModel.create(getMockUser());
                    const campaign = await CampaignModel.create(getMockCampaign({
                        owner: user._id,
                        price: 1
                    }))
                    const campaign2 = await CampaignModel.create(getMockCampaign({
                        owner: user._id,
                        price: 5
                    }))

                    const req = createMockReq({
                        query: {
                            price: "2"
                        }
                    })
                    const res = createMockRes();

                    await controller.getCampaigns(req, res)

                    expect(res.status).toBeCalledWith(200)
                    const actualJson = res.status().json.mock.calls[0][0];

                    expect(actualJson.campaigns).toHaveLength(1);
                })
            })
        })
    })

    describe("When updating a campaign", () => {
        describe("And the user is unauthenticated", () => {
            it('should throw an error', async () => {
                const req = createMockReq();
                const res = createMockRes();

                await controller.updateCampaign(req, res)
                expect(res.status).toHaveBeenCalledWith(401);

            })
        })

        describe('And the user is not the owner of the campaign', () => {
            it("Should return an unauthorized error", async () => {
                const user = await UserModel.create(getMockUser())
                const campaign = await CampaignModel.create(getMockCampaign({
                    owner: user._id
                }))

                const req = createMockReq({
                    user: {
                        _id: new ObjectId()
                    },
                    params: {
                        id: campaign._id.toString()
                    }
                });

                const res = createMockRes();

                await controller.updateCampaign(req, res)
                expect(res.status).toHaveBeenCalledWith(401);
            })
        });

        describe("And the user is the owner of the campaign", () => {
            describe('And the user is providing valid update data', () => {
                it("Should update the campaign", async () => {
                    const user = await UserModel.create(getMockUser())
                    const campaign = await CampaignModel.create(getMockCampaign({
                        owner: user._id,
                        title: "Old name"
                    }))

                    const req = createMockReq({
                        user: {
                            _id: user._id
                        },
                        params: {
                            id: campaign._id.toString()
                        },
                        body: {
                            title: "New name"
                        }
                    });

                    const res = createMockRes();

                    await controller.updateCampaign(req, res)
                    expect(res.status).toHaveBeenCalledWith(200);

                    const updatedCampaign = await CampaignModel.findOne({_id: campaign._id})

                    if (!updatedCampaign){
                        throw new Error("Campaign not found")
                    }

                    expect(updatedCampaign.title).toEqual("New name")
                })
            });

            describe('And the user is not providing valid update data', () => {
                it("Should throw a 400 error", async () => {
                    const user = await UserModel.create(getMockUser())
                    const campaign = await CampaignModel.create(getMockCampaign({
                        owner: user._id,
                        title: "Old title"
                    }))

                    const req = createMockReq({
                        user: {
                            _id: user._id
                        },
                        params: {
                            id: campaign._id.toString()
                        },
                        body: {
                            title:5
                        }
                    });

                    const res = createMockRes();

                    await controller.updateCampaign(req, res)
                    expect(res.status).toHaveBeenCalledWith(400);

                    const updatedCampaign = await CampaignModel.findOne({_id: campaign._id})

                    if (!updatedCampaign){
                        throw new Error("Campaign not found")
                    }

                    expect(updatedCampaign.title).toEqual(campaign.title)
                })
            });
        })
    })

    describe("When deleting a campaign", () => {
        describe("And the user is unauthenticated", () => {
            it('should throw an error', async () => {
                const req = createMockReq();
                const res = createMockRes();

                await controller.deleteCampaign(req, res)
                expect(res.status).toHaveBeenCalledWith(401);

            })
        })

        describe('And the user is not the owner of the campaign', () => {
            it("should return a 401 unauthorized error", async () => {
                const user = await UserModel.create(getMockUser())
                const campaign = await CampaignModel.create(getMockCampaign({
                    owner: user._id
                }))

                const req = createMockReq({
                    user: {
                        _id: new ObjectId()
                    },
                    params:{
                        id: campaign._id.toString()
                    }
                })
                const res = createMockRes();

                await controller.deleteCampaign(req,res)

                const campaign2 = await CampaignModel.findById(campaign._id)
                expect(res.status).toHaveBeenCalledWith(401)
                expect(campaign2).not.toBeNull()
            })
        })

        describe("And the user is the owner of the campaign", () => {
            it("should delete the campaign", async () => {
                const user = await UserModel.create(getMockUser())
                const campaign = await CampaignModel.create(getMockCampaign({
                    owner: user._id
                }))

                const req = createMockReq({
                    user: user,
                    params:{
                        id: campaign._id.toString()
                    }
                })
                const res = createMockRes();

                await controller.deleteCampaign(req,res)

                const campaign2 = await CampaignModel.findById(campaign._id)
                expect(res.status).toHaveBeenCalledWith(200)
                expect(campaign2).toBeNull()
            })
        })
    })

    afterEach(async () => {
        await CampaignModel.deleteMany({})
        await UserModel.deleteMany({})
        await RoomModel.deleteMany({})

    })
    afterAll(async () => {
        await mongod.stop()
        await mongoose.disconnect()
    })
})