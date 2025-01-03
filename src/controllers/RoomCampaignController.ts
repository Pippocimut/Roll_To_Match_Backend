import { Request, Response } from "express";
import { CreateCampaignDTO, CreateCampaignZodSchema } from "../dto/CreateCampaignDTO";
import { UserCheckDTO, UserCheckZodSchema } from "../dto/UserCheckDTO";
import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { RoomModel } from "../database-models/Room";
import { MongoDocument } from "../data-types";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export class RoomCampaignController {
    public static createCampaign = createCampaign;
    public static getCampaigns = getCampaigns;
}

async function createCampaign(req: Request & { user: string }, res: Response): Promise<void> {
    const getRoom = await RoomModel.findById(req.params.id);
    if (!getRoom) {
        throw new Error('Room does not exist')
    }
    const campaignDTO: CreateCampaignDTO = CreateCampaignZodSchema.parse(req.body)
    const userCheckDTO: UserCheckDTO = UserCheckZodSchema.parse(req.user)
    const campaign: PersistedCampaign = {
        title: campaignDTO.title,
        description: campaignDTO.description,
        owner: new ObjectId(userCheckDTO.user),
        room: new ObjectId(campaignDTO.room),
        tags: campaignDTO.tags,
        registeredAt: new Date(),
        reviews: new DocumentArray([]),
        playerQueue: new DocumentArray([]),
        activePlayers: new DocumentArray([]),
    }

    const campaignCreated = await CampaignModel.create(campaign);
    if (!campaignCreated) {
        throw new Error('Error creating campaign')
    }

    res.status(201).send(campaign);
}

async function getCampaigns(req: Request, res: Response): Promise<void> {
    try {
        const roomId = req.params.roomId;
        const campaigns: MongoDocument<PersistedCampaign>[] = await CampaignModel.find({ room: new ObjectId(roomId) });
        res.send(campaigns);
    } catch (err) {
        res.status(400).send(err);
    }
}
