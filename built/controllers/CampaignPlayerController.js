"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignPlayerController = void 0;
const User_1 = require("../database_models/User");
const Campaign_1 = require("../database_models/Campaign");
class CampaignPlayerController {
    static createPlayer = createPlayer;
    static getPlayers = getPlayers;
    static getPlayer = getPlayer;
    static deletePlayer = deletePlayer;
}
exports.CampaignPlayerController = CampaignPlayerController;
async function createPlayer(req, res) {
    try {
        const { campaignId, playerId } = req.params;
        const user = await User_1.UserModel.findById(playerId);
        if (!user) {
            throw new Error('User not found');
        }
        const campaign = await Campaign_1.CampaignModel.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const player = {
            id: user._id,
            slug: user.slug,
            email: user.email
        };
        campaign.activePlayers.push(player);
        await campaign.save();
        res.status(201).json(player);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getPlayers(req, res) {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign_1.CampaignModel.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        res.json(campaign.activePlayers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getPlayer(req, res) {
    try {
        const { campaignId, playerId } = req.params;
        const campaign = await Campaign_1.CampaignModel.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const player = campaign.activePlayers.find(player => player.id.toString() === playerId);
        if (!player) {
            throw new Error('Player not found');
        }
        res.json(player);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function deletePlayer(req, res) {
    try {
        const { campaignId, playerId } = req.params;
        const campaign = await Campaign_1.CampaignModel.findById(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const playerIndex = campaign.activePlayers.findIndex(player => player.id.toString() === playerId);
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }
        campaign.activePlayers.splice(playerIndex, 1);
        await campaign.save();
        res.json({ message: 'Player removed' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
//# sourceMappingURL=CampaignPlayerController.js.map