import { Request, Response } from "express";
import { CreateCampaignDTO, CreateCampaignZodSchema } from "../dto/CreateCampaignDTO";
import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { RoomModel } from "../database-models/Room";
import { MongoDocument } from "../data-types";

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

        res.redirect('/room/' + getRoom._id.toString());
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
