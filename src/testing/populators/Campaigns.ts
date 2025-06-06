import mongoose from 'mongoose';
import {faker} from "@faker-js/faker";
import {PersistedCampaign} from "@roll-to-match/models";
import 'dotenv/config';
import {Populator} from '../data-types/populator';
import RoomPopulator from './Rooms';
import UserPopulator from './Users';
import {Games} from '../../data-types/games'
import {Days, Frequencies} from "../../data-types";
import {CampaignTags} from "../../data-types/campaign-tags";

const {DocumentArray} = mongoose.Types;

export class CampaignPopulator extends Populator {
    public static populatorCollection = "campaign";
    static dependencies = [UserPopulator, RoomPopulator]

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
                const rooms = await roomCollection.find({owner: owner._id}).toArray();
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

                    const campaignsInRoom = await campaignCollection.find({room: room._id}).toArray();
                    if (!campaignsInRoom) {
                        continue;
                    }

                    await roomCollection.updateOne({_id: room._id}, {$set: {campaigns: campaignsInRoom.map(campaign => campaign._id)}});

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
            image: "",
            schedule: {
                days: faker.helpers.arrayElements(Object.values(Days), {min: 1, max: 1}),
                time: faker.date.anytime().toLocaleTimeString(navigator.language, {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                frequency: faker.helpers.enumValue(Frequencies)
            },
            maxSeats: faker.number.int({min: 1, max: 4}),
            price: faker.number.float({min: 0.00, max: 20.00, fractionDigits: 2}),
            languages: [
                faker.lorem.word()
            ],
            requirements: faker.lorem.paragraph(),
            location: {
                type: "Point",
                coordinates: [faker.location.longitude({max: 0.5, min: -0.5}), faker.location.latitude({
                    max: 51.5,
                    min: 51
                })]
            },
            tags: tags,
            playerQueue: [],
            activePlayers: [],
            registeredAt: new Date(),
            owner: owner._id,
            game: faker.helpers.enumValue(Games),
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

            const result = await collection.createIndex({location: "2dsphere"});

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