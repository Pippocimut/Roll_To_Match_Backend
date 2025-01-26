import { Request, Response } from "express";
import { CreateCampaignDTO, CreateCampaignZodSchema } from "../dto/CreateCampaignDTO";
import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { RoomModel } from "../database-models/Room";
import { CampaignTags, MongoDocument } from "../data-types";
import CampaignAdapter from "../adapters/Campaign";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export class RoomCampaignController {
    public static createCampaign = createCampaign;
    public static getCampaigns = getCampaigns;
}

async function createCampaign(req: Request, res: Response): Promise<void> {
    try {
        const getRoom = await RoomModel.findById(req.params.id);
        if (!getRoom) {
            throw new Error('Room does not exist')
        }
        console.log("All good getting room")

        const campaignDTO: CreateCampaignDTO = CreateCampaignZodSchema.parse(req.body)

        console.log("All good parsing campaign")

        const coordinates = campaignDTO.location ? [campaignDTO.location.lng || 0, campaignDTO.location.lat || 0] : [0, 0]

        const location =  {
            type: "Point",
            coordinates: coordinates
        }
        
        const tags = campaignDTO.tags || []
        if (tags.length > 0) {
            const invalidTags = tags.filter(tag => !Object.values(CampaignTags).includes(tag))
            if (invalidTags.length > 0) {
                throw new Error('Invalid tags')
            }
        }
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }
        const owner = new ObjectId(req.user._id.toString())
        const room = new ObjectId(getRoom._id.toString())

        const campaign: PersistedCampaign = {
            title: campaignDTO.title,
            description: campaignDTO.description,
            owner: owner,
            room: room,
            location: location,
            tags: tags,
            registeredAt: new Date(),
            reviews: new DocumentArray([]),
            playerQueue: [],
            activePlayers: [],
        }

        console.log("All good creating campaign")

        const campaignCreated = await CampaignModel.create(campaign);
        if (!campaignCreated) {
            throw new Error('Error creating campaign')
        }

        console.log("All good creating campaign")

        const updateRoom = await RoomModel.findByIdAndUpdate(getRoom._id, { $addToSet: { campaigns: campaignCreated._id } });
        if (!updateRoom) {
            throw new Error('Error updating room')
        }

        console.log("All good updating room")

        const adaptedCampaign = CampaignAdapter.fromPersistedToReturnedCampaign(campaignCreated)
        res.status(200).send(adaptedCampaign);
    } catch (err) {
        res.status(400).send(err);
    }
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
