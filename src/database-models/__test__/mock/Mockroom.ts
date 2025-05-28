import {PersistedRoom} from "@roll-to-match/models";

const {ObjectId} = require('mongoose').Types;

export function getMockRoom(room?: Partial<PersistedRoom>): PersistedRoom {
    return {
        title: "title",
        campaigns: [],
        owner: new ObjectId(),
        ...room
    }
}