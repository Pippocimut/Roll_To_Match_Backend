// require the necessary libraries
const MongoClient = require("mongodb").MongoClient;
import mongoose from 'mongoose';
import { faker } from "@faker-js/faker";
import { PersistedCampaign } from "../../database_models/Campaign";
import dotenv from 'dotenv';
dotenv.config();

const { DocumentArray } = mongoose.Types;

async function seedDB(test = false) {
    // Connection URL
    const uri = "mongodb+srv://NodeJSUser:ITfgdGZUTW1gJH6y@cluster0.lxafrex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = test ? "roll-to-match-test" : "roll-to-match";

    try {
        await client.connect();
        console.log("Connected correctly to server");
        const usersCollection = client.db(database).collection("users");
        const roomCollection = client.db(database).collection("rooms");
        const campaignCollection = client.db(database).collection("campaigns");

        let dummyCampaign: PersistedCampaign[] = [];

        for (let i = 0; i < 400; i++) {

            const owner = await usersCollection.aggregate([{ $sample: { size: 1 } }]).next();

            if (!owner) {
                continue;
            }

            const room = await roomCollection.aggregate([{
                $match: {
                    owner: owner._id
                }
            }, { $sample: { size: 1 } }]).next();

            if (!room) {
                continue;
            }

            const campaign: PersistedCampaign = {
                title: faker.lorem.words(3),
                description: faker.lorem.paragraph(),
                location: {
                    type: "Point",
                    coordinates: [faker.location.longitude(), faker.location.latitude()]
                },
                tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
                playerQueue: new DocumentArray([]),
                activePlayers: new DocumentArray([]),
                reviews: new DocumentArray([]),
                registeredAt: new Date(),
                owner: owner._id,
                room: room._id,
            }

            dummyCampaign.push(campaign);

            console.log("added room for user", owner.username, "and room", room._id);
        }

        await campaignCollection.insertMany(dummyCampaign);

        console.log("Database seeded with Rooms! :)");
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

async function resetDB(test = false) {
    const uri = "mongodb+srv://NodeJSUser:ITfgdGZUTW1gJH6y@cluster0.lxafrex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected correctly to server");
        const dbName = test ? "roll-to-match-test" : "roll-to-match";

        const collection = client.db("roll-to-match").collection("campaigns");

        await collection.deleteMany({});

        //drop the collection
        await collection.drop();

        //recreate the collection
        await client.db("roll-to-match").createCollection("campaigns");

        //index the collection
        await collection.createIndex({ location: "2dsphere" });

        console.log("Collection campaigns reset");
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

export default { seedDB, resetDB };