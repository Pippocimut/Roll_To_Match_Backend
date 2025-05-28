import {MongoDocument} from "../data-types";
import {PersistedRoom, RoomModel} from "@roll-to-match/models";
import {faker} from "@faker-js/faker";

export interface IRoomService {
    createRandomRoom(ownerId: string): Promise<MongoDocument<PersistedRoom>>;

}

export class RoomService implements IRoomService {
    private roomModel: typeof RoomModel;

    public constructor(roomModel: typeof RoomModel) {
        this.roomModel = roomModel;
    }

    public async createRandomRoom(ownerId: string): Promise<MongoDocument<PersistedRoom>> {

        let slug = faker.lorem.slug() + Math.ceil(Math.random() * 1000);
        let getRoomByName = await this.roomModel.findOne({
            title: slug
        })

        while (getRoomByName != null) {
            const slug = faker.lorem.slug() + Math.ceil(Math.random() * 1000);
            getRoomByName = await this.roomModel.findOne({
                title: slug
            })
        }

        return await this.roomModel.create({
            title: slug,
            owner: ownerId,
        });
    }

}