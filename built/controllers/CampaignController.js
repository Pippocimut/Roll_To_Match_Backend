"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignController = void 0;
const Room_1 = require("../database_models/Room");
const mongoose_1 = __importDefault(require("mongoose"));
const CreateCampaignDTO_1 = require("../dto/CreateCampaignDTO");
const Campaign_1 = require("../database_models/Campaign");
const UpdateCampaignDTO_1 = require("../dto/UpdateCampaignDTO");
const UserCheckDTO_1 = require("../dto/UserCheckDTO");
const { ObjectId, DocumentArray } = mongoose_1.default.Types;
class CampaignController {
    static createCampaign = createCampaign;
    static getCampaigns = getCampaigns;
    static getCampaign = getCampaign;
    static updateCampaign = updateCampaign;
    static deleteCampaign = deleteCampaign;
}
exports.CampaignController = CampaignController;
async function createCampaign(req, res) {
    const getRoom = await Room_1.RoomModel.findById(req.params.id);
    if (!getRoom) {
        return res.status(400).send({ message: 'Room does not exist' });
    }
    const campaignDTO = CreateCampaignDTO_1.CreateCampaignZodSchema.parse(req.body);
    const userCheckDTO = UserCheckDTO_1.UserCheckZodSchema.parse(req.user);
    const campaign = {
        title: campaignDTO.title,
        description: campaignDTO.description,
        owner: new ObjectId(userCheckDTO.user),
        room: new ObjectId(campaignDTO.room),
        location: campaignDTO.location,
        tags: campaignDTO.tags,
        registeredAt: new Date(),
        reviews: new DocumentArray([]),
        playerQueue: new DocumentArray([]),
        activePlayers: new DocumentArray([]),
    };
    const campaignCreated = await Campaign_1.CampaignModel.create(campaign);
    if (!campaignCreated) {
        return res.status(400).send({ message: 'Error creating campaign' });
    }
    res.status(201).send(campaign);
}
async function getCampaigns(req, res) {
    try {
        const campaigns = await Campaign_1.CampaignModel.find();
        res.send(campaigns);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
async function getCampaign(req, res) {
    try {
        const campaign = await Campaign_1.CampaignModel.findById(req.params.id);
        if (!campaign) {
            return res.status(404).send({ message: 'Campaign not found' });
        }
        res.send(campaign);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
async function updateCampaign(req, res) {
    const updateCampaignDTO = UpdateCampaignDTO_1.UpdateCampaignZodSchema.parse(req.body);
    try {
        const campaign = await Campaign_1.CampaignModel.findByIdAndUpdate(req.params.id, updateCampaignDTO, { new: true });
        res.send(campaign);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
async function deleteCampaign(req, res) {
    const getCampaign = await Campaign_1.CampaignModel.findById(req.params.id).exec();
    const forceDelete = req.params.forceDelete ? true : false;
    if (!getCampaign) {
        return res.status(400).send({ message: 'Campaign does not exist' });
    }
    if (getCampaign.owner.toString() !== req.user.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    if (getCampaign.activePlayers.length > 0) {
        if (!forceDelete) {
            return res.status(400).send({ message: 'Campaign has active players inside use force delete or kick players from campaign' });
        }
    }
    const deletedRoom = await Room_1.RoomModel.deleteOne(getCampaign._id);
    res.send("room deleted");
}
//# sourceMappingURL=CampaignController.js.map