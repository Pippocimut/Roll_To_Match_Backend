import mongoose from 'mongoose';
import 'dotenv/config';
import { Populator } from '../data-types/populator';
import CampaignPopulator from './Campaigns';
import { UserPopulator } from './Users';

export class CampaignPlayerQueuePopulator extends Populator {
    public static populatorCollection = "campaign";
    static dependencies = [UserPopulator, CampaignPopulator]

    public async seedDB(recordsN = 100): Promise<void> {
        try {
            await this.client.connect();
            console.log("Connected correctly to server");

            let playerQueueCreated = 0;
            while (playerQueueCreated < recordsN) {
                playerQueueCreated += await this.populate(recordsN - playerQueueCreated);
            }

            console.log("Database seeded with PlayerQueue! :)");
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.stack);
            }
            console.log("Error seeding database with PlayerQueue");

        } finally {
            await this.client.close();
        }
    }

    private async populate(toCreate: number): Promise<number> {
        let playerQueueCreated = 0;

        const usersCollection = this.client.db(this.databaseName).collection("users");
        const campaignCollection = this.client.db(this.databaseName).collection("campaigns");

        const pagesize = 10;

        const campaignSize = await campaignCollection.countDocuments();
        const userSize = await usersCollection.countDocuments();
        const pages = Math.ceil(campaignSize / pagesize);

        for (let i = 0; i < pages; i++) {
            const campaigns = await campaignCollection.find().skip(i * pagesize).limit(pagesize).toArray();

            for (const campaign of campaigns) {
                const numberOfPlayers = Math.floor(Math.random() * 10) + 1;
                //get random users from the users collection
                let users = await usersCollection.find().skip(Math.floor(Math.random() * userSize)).limit(numberOfPlayers).toArray();
                if (!users) {
                    continue;
                }

                if (users.length > toCreate - playerQueueCreated) {
                    users = users.slice(0, toCreate - playerQueueCreated);
                }

                for (const user of users) {
                    campaign.playerQueue.push(user._id);
                    playerQueueCreated++;
                }

                if (playerQueueCreated >= toCreate) {
                    return playerQueueCreated;
                }
            }
        }

        return playerQueueCreated
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