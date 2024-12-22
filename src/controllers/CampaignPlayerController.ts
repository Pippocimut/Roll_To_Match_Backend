import { Request, Response } from 'express'
import { PersistedUser, UserModel } from '../database_models/User'
import { MongoDocument } from '../types'
import { PersistedPlayer } from '../database_models/Player'
import { CampaignModel } from '../database_models/Campaign'

export class CampaignPlayerController {
    public static createPlayer = createPlayer
    public static getPlayers = getPlayers
    public static getPlayer = getPlayer
    public static deletePlayer = deletePlayer
}

async function createPlayer(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId, playerId } = req.params

        const user: MongoDocument<PersistedUser> = await UserModel.findById(playerId)
        if (!user) {
            throw new Error('User not found')
        }

        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }

        const player: PersistedPlayer = {
            id: user._id,
            slug: user.slug,
            email: user.email
        }

        campaign.activePlayers.push(player)
        await campaign.save()
        res.status(201).json(player)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function getPlayers(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId } = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
           throw new Error('Campaign not found')
        }
        res.json(campaign.activePlayers)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function getPlayer(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId, playerId } = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }

        const player = campaign.activePlayers.find(player => player.id.toString() === playerId)
        if (!player) {
            throw new Error('Player not found')
        }

        res.json(player)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function deletePlayer(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId, playerId } = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }

        const playerIndex = campaign.activePlayers.findIndex(player => player.id.toString() === playerId)
        if (playerIndex === -1) {
            throw new Error('Player not found')
        }

        campaign.activePlayers.splice(playerIndex, 1)
        await campaign.save()
        res.json({ message: 'Player removed' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}