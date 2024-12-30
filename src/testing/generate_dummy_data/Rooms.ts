// require the necessary libraries
const MongoClient = require("mongodb").MongoClient;
import { PersistedRoom } from "../../database_models/Room";
import dotenv from 'dotenv';
dotenv.config();

async function seedDB(test = false) {
    // Connection URL
    const uri = "mongodb+srv://NodeJSUser:ITfgdGZUTW1gJH6y@cluster0.lxafrex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = test? "roll-to-match-test" : "roll-to-match";

    try {
        await client.connect();
        console.log("Connected correctly to server");
        const usersCollection = client.db(database).collection("users");
        const collection = client.db(database).collection("rooms");

        let dummyRooms: PersistedRoom[] = [];

        for (let i = 0; i < 100; i++) {
            const owner = await usersCollection.aggregate([{ $sample: { size: 1 } }]).next();
            if (!owner) {
                continue;
            }

            dummyRooms.push({
                campaigns: [],
                owner: owner._id
            });
            console.log("added room for user", owner.username);
        }

        await collection.insertMany(dummyRooms);

        console.log("Database seeded with Rooms! :)");
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

async function resetDB(test = false) {
    // Connection URL
    const uri = process.env.MONGO_URI;

    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const dbName = test? "roll-to-match-test" : "roll-to-match";
        const collection = client.db(dbName).collection("rooms");
        await collection.deleteMany({});

        //Drop the collection and recreate it
        await collection.drop();
        
        //recreate collection
        await client.db(dbName).createCollection("rooms");

        console.log("Rooms collection reset");
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}


export default { seedDB, resetDB };