import Users from './Users';
import Rooms from './Rooms';
import Campaigns from './Campaigns';

const scripts = {
    users: Users,
    rooms: Rooms,
    campaigns: Campaigns
}

async function main() {
    console.log("Starting population of database with dummy data");

    const scriptToRun = process.argv[2] || 'all';
    const reset = process.argv[3] === 'reset' || process.argv[4] === 'reset';
    const test = process.argv[3] === 'test' || process.argv[4] === 'test';

    if (reset) {
        console.log("Resetting database");
        for (const script in scripts) {
            console.log(`Resetting collection ${script}`);
            await scripts[script].resetDB();
        }
    }

    switch (scriptToRun) {
        case 'users':
            await scripts.users.seedDB(test);
            break;
        case 'rooms':
            await scripts.rooms.seedDB(test);
            break;
        case 'campaigns':
            await scripts.campaigns.seedDB(test);
            break;
        case 'all':
            for (const script in scripts) {
                console.log(`Running script ${script}`);
                await scripts[script].seedDB(test);
            }
            break;
        default:
            console.log('Invalid script name');
            break;
    }

    console.log("Database population completed");

    process.exit(0);
}

main().catch(error => {
    console.error("An error occurred:", error);
    process.exit(1);
});