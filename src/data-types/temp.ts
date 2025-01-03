import mongoose from "mongoose";

export enum Topics {
    POLITICS = "politics",
    HEALTH = "health",
    SPORTS = "sports",
    TECH = "tech"
}

export enum PostStatus {
    LIVE = "live",
    EXPIRED = "expired"
}

export enum CampaignTags {
    DND = "dnd",
    BOARDGAMES = "boardgames",
    CARDGAMES = "cardgames",
    WARGAMES = "wargames",
    MINIATURES = "miniatures",
    RPG = "rpg"
}

export type MongoDocument<T> = T & {_id: mongoose.Types.ObjectId};