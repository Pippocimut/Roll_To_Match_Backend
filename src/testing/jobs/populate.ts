import "dotenv/config";
import PopulatorInitializer from "../populators";
import { IPopulator } from "../data-types";

export default async function run(args: string[]) {
    console.log("Starting population of database with dummy data");

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI not found in .env");
    }

    const reset = args.includes('reset');
    const test = args.includes('test');
    const scriptToRun = args[0] || 'all';
    const database_name = test ? "roll-to-match-test" : "roll-to-match";

    const scripts = scriptToRun === 'all' ? PopulatorInitializer.initializeAll(database_name, process.env.MONGO_URI) : [PopulatorInitializer.initialize(scriptToRun, database_name, process.env.MONGO_URI)];

    const populators = scripts.filter((populator) => populator !== null) as IPopulator[];

    if (populators.length === 0) {
        console.log("No populators found for the given script name");
        return process.exit(1);
    }

    if (reset) {
        await resetDB(populators);
    }

    await populateDB(populators);

    console.log("Database population completed");
    return process.exit(0);
}

async function resetDB(populators: IPopulator[]) {
    for (const populator of populators) {
        await populator.resetDB();
    }
}

async function populateDB(populators: IPopulator[]) {
    for (const populator of populators) {
        await populator.seedDB();
    }
}