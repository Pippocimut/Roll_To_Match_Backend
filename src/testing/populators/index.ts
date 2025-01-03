import { IPopulator } from '../data-types';
import CampaignPopulator from './Campaigns';
import RoomPopulator from './Rooms';
import UserPopulator from './Users';

const PopulatorList = [
    CampaignPopulator,
    UserPopulator,
    RoomPopulator,
]

class PopulatorInitializer {
    private static populatorList = PopulatorList;
    
    public static initialize(populatorName: string, database_name: string, mongo_uri: string): IPopulator | null {
        const populator = this.populatorList.find((Populator) => Populator.populatorCollection.toLocaleLowerCase() === populatorName.toLocaleLowerCase());
        const names = this.populatorList.map((Populator) => Populator.name);
        return populator ? new populator(database_name, mongo_uri) : null;
    }

    public static initializeAll(database_name: string, mongo_uri: string): IPopulator[] {
        const populators = Object.values(this.populatorList)
            .map((Populator) => ({
                instance: new Populator(database_name, mongo_uri),
                level: Populator.getLevel()
            })).sort((a, b) => a.level - b.level).map((populator) => populator.instance);
        return populators
    }
}

export default PopulatorInitializer;