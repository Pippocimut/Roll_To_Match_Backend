import { Request, Response } from 'express'
import { PersistedUser, UserModel } from '../database-models/User'
import { MongoDocument } from '../data-types'
import { PersistedPlayer } from '../database-models/Player'
import { CampaignModel } from '../database-models/Campaign'
import { UserCheckDTO, UserCheckZodSchema } from 'dto/UserCheckDTO'

export class CampaignCandidatePlayerController {
    public static createCandidatePlayer = createCandidatePlayer
    public static getCandidatePlayers = getCandidatePlayers
    public static getCandidatePlayer = getCandidatePlayer
    public static deleteCandidatePlayer = deleteCandidatePlayer
}

async function createCandidatePlayer(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId } = req.params
        const userDTO: UserCheckDTO = UserCheckZodSchema.parse({ id: req.user })

        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }

        const player: PersistedPlayer = {
            id: userDTO.user._id,
            slug: userDTO.user.slug,
            email: userDTO.user.email
        }

        campaign.playerQueue.push(player)

        await campaign.save()
        res.status(201).json(player)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function getCandidatePlayers(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId } = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }
        res.json(campaign.playerQueue)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function getCandidatePlayer(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId, playerId } = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }

        const player = campaign.playerQueue.find(player => player.id.toString() === playerId)
        if (!player) {
            throw new Error('Player not found')
        }

        res.json(player)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function deleteCandidatePlayer(req: Request, res: Response): Promise<void> {
    try {
        const { campaignId, playerId } = req.params
        const userDTO: UserCheckDTO = UserCheckZodSchema.parse({ id: req.user })

        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }

        if (campaign.owner.toString() !== userDTO.id || userDTO.id !== playerId) {
            throw new Error('Unauthorized')
        }

        const playerIndex = campaign.playerQueue.findIndex(player => player.id.toString() === playerId)
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