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

    protected static dependencies: typeof Populator.constructor[] = []
    
    public constructor(databaseName: string, databaseURI: string) {
        this.databaseName = databaseName;
        this.databaseURI = databaseURI;
        this.client = new MongoClient(this.databaseURI);
    }
 
    public static getLevel(): number {
        let level = 1
        //get ta list of the classes of the dependencies
        const classes = this.dependencies.map(dep => dep.constructor) as typeof Populator[]
        
        if (this.dependencies.length > 0) {
            const allLevels: number[] = classes.map(dep => dep.getLevel())
            level = Math.max(...allLevels) + 1
        }

        return level;
    }
    public abstract resetDB(): Promise<void>;
    public abstract seedDB(): Promise<void>;
}