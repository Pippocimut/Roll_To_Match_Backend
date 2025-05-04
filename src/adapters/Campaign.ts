import {PersistedCampaign} from "../database-models/Campaign";
import {MongoDocument} from "../data-types";
import {AdaptedPlayer} from "./Player";
import {fromPersistedToReturnedPlayer} from "./Player";
import {PersistedUser} from "../database-models/User";

export type AdaptedCampaign = {
    id: string,
    title: string,
    description: string,
    owner: string,
    room: string,
    locationName?:string,
    contactInfo?:string;
    languages: string[],
    schedule: {
        time: string,
        days: string[],
        frequency: string,
    },
    image: string,
    requirements: string,
    price: number,
    maxSeats: number,
    game: string,
    tags: string[],
    registeredAt: Date,
    playerQueue: AdaptedPlayer[],
    activePlayers: AdaptedPlayer[],
}

function fromPersistedToReturnedCampaign(persistedCampaign: MongoDocument<PersistedCampaign>): AdaptedCampaign {
    const playerQueue = persistedCampaign.playerQueue.map(player => fromPersistedToReturnedPlayer(player))
    const activePlayers = persistedCampaign.activePlayers.map(player => fromPersistedToReturnedPlayer(player))

    //Proper owner hydration is necessary
    const owner = persistedCampaign.owner

    return {
        id: persistedCampaign._id.toString(),
        title: persistedCampaign.title,
        description: persistedCampaign.description,
        owner: persistedCampaign.owner.toString(),
        room: persistedCampaign.room.toString(),
        locationName: persistedCampaign.locationName,
        tags: persistedCampaign.tags,
        registeredAt: persistedCampaign.registeredAt,
        game: persistedCampaign.game,
        price: persistedCampaign.price,
        languages: persistedCampaign.languages,
        maxSeats: persistedCampaign.maxSeats,
        schedule: persistedCampaign.schedule,
        image: persistedCampaign.image,
        contactInfo: persistedCampaign.contactInfo,
        requirements: persistedCampaign.requirements,
        playerQueue,
        activePlayers
    }
}

export default {fromPersistedToReturnedCampaign}
