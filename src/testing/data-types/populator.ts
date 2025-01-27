import { MongoClient } from "mongodb";

export interface IPopulator {
    resetDB(): Promise<void>;
    seedDB(): Promise<void>;
}

export abstract class Populator implements IPopulator {
    protected databaseName: string;
    protected databaseURI: string;
    protected client: MongoClient;
    public static populatorCollection: string = "Populator";

    public constructor(databaseName: string, databaseURI: string) {
        this.databaseName = databaseName;
        this.databaseURI = databaseURI;
        this.client = new MongoClient(this.databaseURI);
    }

    protected static dependencies: Array<typeof Populator> = [];

    public static getLevel(): number {
        let level = 1;

        if (this.dependencies.length > 0) {
            const allLevels: number[] = this.dependencies.map(PopulatorClass => 
                PopulatorClass.getLevel()
            );
            level = Math.max(...allLevels) + 1;
        }

        return level;
    }
    public abstract resetDB(): Promise<void>;
    public abstract seedDB(): Promise<void>;
}