"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaign = createCampaign;
exports.getCampaigns = getCampaigns;
exports.getCampaign = getCampaign;
exports.updateCampaign = updateCampaign;
const Room_1 = require("../database_models/Room");
const mongoose_1 = __importDefault(require("mongoose"));
const CreateCampaignDTO_1 = require("../dto/CreateCampaignDTO");
const Campaign_1 = require("../database_models/Campaign");
const UpdateCampaignDTO_1 = require("../dto/UpdateCampaignDTO");
const UserCheckDTO_1 = require("../dto/UserCheckDTO");
const { ObjectId, DocumentArray } = mongoose_1.default.Types;
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
        res.status(400).send;
    }
}
async function getCampaign(req, res) {
    try {
        const campaign = await Campaign_1.CampaignModel.findById(req.params.id);
        res.send(campaign);
    }
    catch (err) {
        res.status(400).send;
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
//# sourceMappingURL=CampaignController.js.map