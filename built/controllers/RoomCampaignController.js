"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomCampaignController = void 0;
const CreateCampaignDTO_1 = require("../dto/CreateCampaignDTO");
const UserCheckDTO_1 = require("../dto/UserCheckDTO");
const Campaign_1 = require("../database_models/Campaign");
const Room_1 = require("../database_models/Room");
const { ObjectId, DocumentArray } = require('mongoose').Types;
class RoomCampaignController {
    static createCampaign = createCampaign;
    static getCampaigns = getCampaigns;
}
exports.RoomCampaignController = RoomCampaignController;
async function createCampaign(req, res) {
    const getRoom = await Room_1.RoomModel.findById(req.params.id);
    if (!getRoom) {
        throw new Error('Room does not exist');
    }
    const campaignDTO = CreateCampaignDTO_1.CreateCampaignZodSchema.parse(req.body);
    const userCheckDTO = UserCheckDTO_1.UserCheckZodSchema.parse(req.user);
    const campaign = {
        title: campaignDTO.title,
        description: campaignDTO.description,
        owner: new ObjectId(userCheckDTO.user),
        room: new ObjectId(campaignDTO.room),
        tags: campaignDTO.tags,
        registeredAt: new Date(),
        reviews: new DocumentArray([]),
        playerQueue: new DocumentArray([]),
        activePlayers: new DocumentArray([]),
    };
    const campaignCreated = await Campaign_1.CampaignModel.create(campaign);
    if (!campaignCreated) {
        throw new Error('Error creating campaign');
    }
    res.status(201).send(campaign);
}
async function getCampaigns(req, res) {
    try {
        const roomId = req.params.roomId;
        const campaigns = await Campaign_1.CampaignModel.find({ room: new ObjectId(roomId) });
        res.send(campaigns);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
//# sourceMappingURL=RoomCampaignController.js.map