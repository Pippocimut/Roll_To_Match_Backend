import {PersistedCampaign, PopulatedPersistedCampaign} from "../database-models/Campaign";
import {MongoDocument} from "../data-types";
import {AdaptedPlayer} from "./Player";
import {fromPersistedToReturnedPlayer} from "./Player";
import {PersistedUser} from "../database-models/User";

export type AdaptedCampaign = {
    id: string,
    title: string,
    description: string,
    owner: AdaptedPlayer,
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
    nextSession?: Date,
    registeredAt: Date,
    playerQueue: AdaptedPlayer[],
    activePlayers: AdaptedPlayer[],
}

function fromPersistedToReturnedCampaign(persistedCampaign: MongoDocument<PopulatedPersistedCampaign>): AdaptedCampaign {
    const playerQueue = persistedCampaign.playerQueue.map(player => fromPersistedToReturnedPlayer(player))
    const activePlayers = persistedCampaign.activePlayers.map(player => fromPersistedToReturnedPlayer(player))

    //Proper owner hydration is necessary
    const owner = persistedCampaign.owner

    return {
        id: persistedCampaign._id.toString(),
        title: persistedCampaign.title,
        description: persistedCampaign.description,
        owner: fromPersistedToReturnedPlayer(persistedCampaign.owner),
        room: persistedCampaign.room.toString(),
        locationName: persistedCampaign.locationName,
        tags: persistedCampaign.tags,
        registeredAt: persistedCampaign.registeredAt,
        game: persistedCampaign.game,
        price: persistedCampaign.price,
        languages: persistedCampaign.languages,
        maxSeats: persistedCampaign.maxSeats,
        nextSession: persistedCampaign.nextSession,
        schedule: persistedCampaign.schedule,
        image: persistedCampaign.image,
        contactInfo: persistedCampaign.contactInfo,
        requirements: persistedCampaign.requirements,
        playerQueue,
        activePlayers
    }
}

export default {fromPersistedToReturnedCampaign}
