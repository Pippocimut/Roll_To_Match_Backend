import "dotenv/config";
import populate from  './populate'
import { AllowedJobs } from "../data-types";

async function main() {
    console.log("Starting job");

    switch (process.argv[2]) {
        case AllowedJobs.populate:
            await populate(process.argv.slice(3));
            break;
        default:
            console.log("Invalid job name");
            process.exit(1);
    }

    console.log("Job completed successfully");

    process.exit(0);
}

main().catch(error => {
    console.error("An error occurred:", error);
    process.exit(1);
});