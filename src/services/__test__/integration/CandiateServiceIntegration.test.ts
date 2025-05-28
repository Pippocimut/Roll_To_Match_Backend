import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose, {Types} from "mongoose";
import {CandidateService} from "../../CandidateService";
import {CampaignModel, PersistedUser, UserModel} from "@roll-to-match/models";
import {MongoDocument} from "@roll-to-match/types";
import {getMockCampaign} from "@roll-to-match/models-test/mock/MockCampaign";
import {getMockUser} from "@roll-to-match/models-test/mock/MockUser";

const {ObjectId} = require('mongoose').Types;

describe("CandidateService", () => {

    let service = new CandidateService(CampaignModel)

    let mongod;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create()
        const uri = await mongod.getUri()
        await mongoose.connect(uri, {})
    })

    describe("when creating a candidate", () => {
        describe("and the campaign doesnt exist", () => {
            it("should throw an error", async () => {
                await expect(service.createCandidate(new ObjectId(), {} as MongoDocument<PersistedUser>)).rejects.toThrow();
            })
        })
        describe("and the campaign exists", () => {
            it("should create a candidate", async () => {

                const campaign = await CampaignModel.create(getMockCampaign())
                const user = await UserModel.create(getMockUser())

                const candidate = service.createCandidate(campaign._id.toString(), user)

                expect(candidate).toBeDefined()
            })
        })
    })

    describe("when deleting a candidate", () => {
        describe("and the campaign doesnt exist", () => {
            it('should throw an error', async () => {
                await expect(service.deleteCandidate(new ObjectId(), new ObjectId())).rejects.toThrow();
            });
        })
        describe("and the campaign exists", () => {
            it('should delete a candidate',async  () => {
                const user = await UserModel.create(getMockUser());
                const campaign = await CampaignModel.create(getMockCampaign({
                    playerQueue : [user]
                }));

                const updateResult = service.deleteCandidate(campaign._id.toString(), user._id.toString());

                expect((await updateResult).matchedCount).toBe(1);
                expect((await updateResult).modifiedCount).toBe(1);
            });
        })
    })

    afterEach(async () => {
        service = new CandidateService(CampaignModel)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongod.stop()
    })
})