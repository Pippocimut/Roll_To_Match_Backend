// require the necessary libraries
import { faker, fi } from "@faker-js/faker";
const MongoClient = require("mongodb").MongoClient;
import bcryptjs from 'bcryptjs';
import { PersistedLocalUser } from "../../database_models/User";
import dotenv from 'dotenv';
dotenv.config();

async function seedDB(test = false) {
    // Connection URL
    const uri = "mongodb+srv://NodeJSUser:ITfgdGZUTW1gJH6y@cluster0.lxafrex.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);
    const database = test ? "roll-to-match-test" : "roll-to-match";

    try {
        await client.connect();
        console.log("Connected correctly to server");
        const collection = client.db(database).collection("users");

        let dummyUsers: PersistedLocalUser[] = [];

        for (let i = 0; i < 50; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({ firstName, lastName });
            const username = faker.internet.username({ firstName, lastName });
            const password = faker.internet.password();
            const salt = await bcryptjs.genSalt(5)
            const hashedPassword = await bcryptjs.hash(password, salt)
            const date = faker.date.past();
            const slug = faker.lorem.slug();

            dummyUsers.push({
                username,
                email,
                password: hashedPassword,
                date,
                slug
            });

            console.log("added user", username);
        }

        await collection.insertMany(dummyUsers);

        console.log("Database seeded with Users! :)");
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
        const dbName = test ? "roll-to-match-test" : "roll-to-match";

        const collection = client.db(dbName).collection("users");
        await collection.deleteMany({});

        //drop the collection and recreate it

        await collection.drop();

        //recreate collection
        await client.db(dbName).createCollection("users");

        //index the collection
        await collection.createIndex({ username: 1 }, { unique: true });
        await collection.createIndex({ email: 1 }, { unique: true });
        await collection.createIndex({ slug: 1 }, { unique: true });

        console.log("Users collection reset");

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}


export default { seedDB, resetDB };