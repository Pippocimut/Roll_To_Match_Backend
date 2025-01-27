import mongoose from 'mongoose';
import { faker } from "@faker-js/faker";
import { PersistedCampaign } from "@roll-to-match/models";
import 'dotenv/config';
import { Populator } from '../data-types/populator';
import { CampaignTags } from '../../data-types/temp'
import RoomPopulator from './Rooms';

const { DocumentArray } = mongoose.Types;

export class CampaignPopulator extends Populator {
    public static populatorCollection = "campaign";
    static dependencies = [RoomPopulator, RoomPopulator]

    public async seedDB(recordsN = 300): Promise<void> {
        try {
            await this.client.connect();
            console.log("Connected correctly to server");

            let campaignCreated = 0;
            while (campaignCreated < recordsN) {
                campaignCreated += await this.populate(recordsN - campaignCreated);
            }

            console.log("Database seeded with Campaigns! :)");
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.stack);
            }
            console.log("Error seeding database with Campaigns");

        } finally {
            await this.client.close();
        }
    }

    private async populate(toCreate: number): Promise<number> {
        let campaignCreated = 0;

        const usersCollection = this.client.db(this.databaseName).collection("users");
        const roomCollection = this.client.db(this.databaseName).collection("rooms");
        const campaignCollection = this.client.db(this.databaseName).collection("campaigns");

        const pagesize = 10;

        const userSize = await usersCollection.countDocuments();
        const pages = Math.ceil(userSize / pagesize);

        for (let i = 0; i < pages; i++) {
            const users = await usersCollection.find().skip(i * pagesize).limit(pagesize).toArray();

            for (const owner of users) {
                const rooms = await roomCollection.find({ owner: owner._id }).toArray();
                if (!rooms) {
                    continue;
                }
                if (rooms.length === 0) {
                    continue;
                }

                for (const room of rooms) {
                    let randomNumberForCampaigns = Math.floor(Math.random() * 2);

                    if (randomNumberForCampaigns === 0) {
                        continue;
                    }

                    if (campaignCreated + randomNumberForCampaigns >= toCreate) {
                        randomNumberForCampaigns = toCreate - campaignCreated;
                    }

                    const toCreateCampaigns: PersistedCampaign[] = []

                    for (let j = 0; j < randomNumberForCampaigns; j++) {
                        toCreateCampaigns.push(this.generateRandomCampaign(owner, room));
                        console.log("added campaign for user", owner.username, "and room", room._id);
                    }

                    campaignCreated += randomNumberForCampaigns;
                    await campaignCollection.insertMany(toCreateCampaigns);

                    const campaignsInRoom = await campaignCollection.find({ room: room._id }).toArray();
                    if (!campaignsInRoom) {
                        continue;
                    }

                    await roomCollection.updateOne({ _id: room._id }, { $set: { campaigns: campaignsInRoom.map(campaign => campaign._id) } });

                    if (campaignCreated >= toCreate) {
                        return campaignCreated;
                    }
                }
            }
        }

        return campaignCreated
    }

    private generateRandomCampaign(owner: any, room: any): PersistedCampaign {
        const tagsValues = Object.values(CampaignTags)

        const tags = [1, 2, 3].map(value => {
            const random = Math.floor(Math.random() * tagsValues.length);
            return tagsValues[random]
        })

        return {
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            location: {
                type: "Point",
                coordinates: [faker.location.longitude(), faker.location.latitude()]
            },
            tags: tags,
            playerQueue: [],
            activePlayers: [],
            reviews: new DocumentArray([]),
            registeredAt: new Date(),
            owner: owner._id,
            room: room._id,
        }
    }

    public async resetDB(): Promise<void> {

        try {
            await this.client.connect();
            console.log("Connected correctly to server");
            const collection = this.client.db(this.databaseName).collection("campaigns");

            await collection.deleteMany({});

            //drop the collection
            await collection.drop();

            //recreate the collection
            await this.client.db(this.databaseName).createCollection("campaigns");

            const result = await collection.createIndex({ location: "2dsphere" });

            console.log(result);
            console.log("Collection campaigns reset");
        } catch (err) {
            if (err instanceof Error) {

                console.log(err.stack);
            }
        } finally {
            await this.client.close();
        }
    }
}
export default CampaignPopulator;