import { RoomModel } from "../database_models/Room";
import mongoose from "mongoose";
import { CreateCampaignDTO, CreateCampaignZodSchema } from "../dto/CreateCampaignDTO";
import { CampaignModel, PersistedCampaign } from "../database_models/Campaign";
import { UpdateCampaignDTO, UpdateCampaignZodSchema } from "../dto/UpdateCampaignDTO";
import { UserCheckDTO, UserCheckZodSchema } from "../dto/UserCheckDTO";
import { MongoDocument } from "../types";

const { ObjectId, DocumentArray } = mongoose.Types;

export class CampaignController {
    public static createCampaign = createCampaign;
    public static getCampaigns = getCampaigns;
    public static getCampaign = getCampaign;
    public static updateCampaign = updateCampaign;
    public static deleteCampaign = deleteCampaign;
}

async function createCampaign(req, res) {
    const getRoom = await RoomModel.findById(req.params.id);
    if (!getRoom) {
        return res.status(400).send({ message: 'Room does not exist' })
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
        return res.status(400).send({ message: 'Error creating campaign' })
    }

    res.status(201).send(campaign);
}

async function getCampaigns(req, res) {
    try {
        const campaigns: MongoDocument<PersistedCampaign>[] = await CampaignModel.find();
        res.send(campaigns);
    } catch (err) {
        res.status(400).send(err);
    }
}

async function getCampaign(req, res) {
    try {
        const campaign: MongoDocument<PersistedCampaign> = await CampaignModel.findById(req.params.id);
        if (!campaign) {
            return res.status(404).send({ message: 'Campaign not found' })
        }
        res.send(campaign);
    } catch (err) {
        res.status(400).send(err);
    }
}

async function updateCampaign(req, res) {
    const updateCampaignDTO: UpdateCampaignDTO = UpdateCampaignZodSchema.parse(req.body)
    try {
        const campaign = await CampaignModel.findByIdAndUpdate(req.params.id, updateCampaignDTO, { new: true });
        res.send(campaign);
    }
    catch (err) {
        res.status(400).send(err);
    }
}


async function deleteCampaign(req, res) {
    const getCampaign: MongoDocument<PersistedCampaign> = await CampaignModel.findById(req.params.id).exec();
    const forceDelete: boolean = req.params.forceDelete ? true : false
    if (!getCampaign) {
        return res.status(400).send({ message: 'Campaign does not exist' })
    }
    if (getCampaign.owner.toString() !== req.user.user) {
        return res.status(401).send({ message: 'Unauthorized' })
    }
    if (getCampaign.activePlayers.length > 0) {
        if (!forceDelete) {
            return res.status(400).send({ message: 'Campaign has active players inside use force delete or kick players from campaign' })
        }
    }

    const deletedRoom = await RoomModel.deleteOne(getCampaign._id)
    res.send("room deleted")
}
