// require the necessary libraries
const MongoClient = require("mongodb").MongoClient;
import { PersistedRoom } from "../../database-models/Room";
import 'dotenv/config';
import { Populator } from "../data-types/populator";
import UserPopulator from "./Users";

export class RoomPopulator extends Populator {
    public static populatorCollection = "room";
    static dependencies = [UserPopulator]
    public async seedDB(recordsN = 100): Promise<void> {

        try {
            await this.client.connect();
            console.log("Connected correctly to server");

            let dummyRooms: PersistedRoom[] = [];

            let roomCreated = 0;
            while (roomCreated < recordsN) {
                roomCreated += await this.populate(recordsN - roomCreated);
            }

            console.log("Database seeded with Campaigns! :)");
        } catch (err) {
            console.log(err.stack);
        } finally {
            await this.client.close();
        }
    }

    public async populate(toCreate: number): Promise<number> {
        let roomCreated = 0;

        const usersCollection = this.client.db(this.databaseName).collection("users");
        const collection = this.client.db(this.databaseName).collection("rooms");

        const pagesize = 10;

        const userSize = await usersCollection.countDocuments();
        const pages = Math.ceil(userSize / pagesize);

        for (let i = 0; i < pages; i++) {
            const users = await usersCollection.find().skip(i * pagesize).limit(pagesize).toArray();

            for (const owner of users) {
                let randomNumberForRooms = Math.floor(Math.random() * 2);

                if (roomCreated + randomNumberForRooms >= toCreate) {
                    randomNumberForRooms = toCreate - roomCreated;
                }

                if (randomNumberForRooms === 0) {
                    continue;
                }

                const roomToCreate: PersistedRoom[] = []

                for (let j = 0; j < randomNumberForRooms; j++) {
                    roomToCreate.push(this.createRandomRoom(owner));
                    console.log("added room for user", owner.username);
                }

                await collection.insertMany(roomToCreate);
                roomCreated += randomNumberForRooms;

                if (roomCreated >= toCreate) {
                    return roomCreated;
                }

            }
        }

        return roomCreated;
    }

    private createRandomRoom(owner: any): PersistedRoom {
        return {
            campaigns: [],
            owner: owner._id
        };
    }

    public async resetDB(): Promise<void> {
        try {
            await this.client.connect();
            const collection = this.client.db(this.databaseName).collection("rooms");
            await collection.deleteMany({});
            await collection.drop();
            await this.client.db(this.databaseName).createCollection("rooms");

            console.log("Rooms collection reset");
        } catch (err) {
            console.log(err.stack);
        } finally {
            await this.client.close();
        }
    }

}
export default RoomPopulator;