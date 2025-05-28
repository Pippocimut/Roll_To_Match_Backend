import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import {RoomModel, UserModel} from "@roll-to-match/models";
import {getMockUser} from "@roll-to-match/models-test/mock/MockUser";
import {RoomService} from "../../RoomService";
import {getMockRoom} from "@roll-to-match/models-test/mock/Mockroom";

describe('RoomService', () => {
    let mongod;
    let service;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = await mongod.getUri();
        await mongoose.connect(uri,{})
        service = new RoomService(RoomModel);
    })

    describe("when requesting to create a room", () => {
        it("should create one and return the room object", async () => {
            const user = await UserModel.create(getMockUser())
            jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(getMockRoom())

            const room = await service.createRandomRoom(user._id.toString())

            expect(room).toBeDefined();

        })
    })

    afterEach(async () => {
        service = new RoomService(RoomModel);
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    })
})