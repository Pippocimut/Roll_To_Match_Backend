// require the necessary libraries
import { faker, fi } from "@faker-js/faker";
const MongoClient = require("mongodb").MongoClient;
import { genSalt, hash } from 'bcryptjs';
import { PersistedLocalUser } from "../../database-models/User";
import 'dotenv/config';
import { Populator } from "../data-types/populator"

export class UserPopulator extends Populator {
    public static populatorCollection = "user";
    public async seedDB(recordsN = 50): Promise<void> {
        try {
            await this.client.connect();
            console.log("Connected correctly to server");
            const collection = this.client.db(this.databaseName).collection("users");

            let dummyUsers: PersistedLocalUser[] = [];

            for (let i = 0; i < recordsN; i++) {
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const email = faker.internet.email({ firstName, lastName });
                const username = faker.internet.username({ firstName, lastName });
                const password = faker.internet.password();
                const salt = await genSalt(5)
                const hashedPassword = await hash(password, salt)
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
            if (err instanceof Error) {
                console.log(err.stack);
            }
        } finally {
            await this.client.close();
        }
    }

    public async resetDB(): Promise<void> {

        try {
            await this.client.connect();

            const collection = this.client.db(this.databaseName).collection("users");
            await collection.deleteMany({});
            await collection.drop();
            await this.client.db(this.databaseName).createCollection("users");

            //index the collection
            await collection.createIndex({ username: 1 }, { unique: true });
            await collection.createIndex({ email: 1 }, { unique: true });
            await collection.createIndex({ slug: 1 }, { unique: true });

            console.log("Users collection reset");

        } catch (err) {
            if (err instanceof Error) {
                console.log(err.stack);
            }
        } finally {
            await this.client.close();
        }
    }

}
export default UserPopulator;