import {Request, Response} from 'express'
import {PersistedUser, UserModel} from '../database-models/User'
import {MongoDocument} from '../data-types'
import {CampaignModel} from '../database-models/Campaign'
import {AdaptedPlayer, fromPersistedToReturnedPlayer} from '../adapters/Player'

export class CampaignPlayerController {
    public static createPlayer = createPlayer/* 
    public static getPlayers = getPlayers
    public static getPlayer = getPlayer*/
    public static kickPlayer = deletePlayer
}

async function deletePlayer(req: Request, res: Response): Promise<void> {
    try {
        const {campaignId, playerId} = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            res.status(404).json({error: 'Campaign not found'})
            return
        }

        if(!req.user) {
            res.status(401).json({error: 'Unauthorized'})
            return
        }

        if (campaign.owner.toString() !== req.user._id.toString()){
            res.status(401).json({error: 'Unauthorized'})
            return
        }

        const playerIndex = campaign.activePlayers.findIndex(player => player._id.toString() === playerId)
        if (playerIndex === -1) {
            res.status(404).json({error: 'Player not found'})
            return
        }

        campaign.activePlayers.splice(playerIndex, 1)
        await campaign.save()
        res.json({message: 'Player removed'})
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({error: error.message})
        }
    }
}

async function createPlayer(req: Request, res: Response): Promise<void> {
    try {
        const {campaignId, playerId} = req.params

        const user: MongoDocument<PersistedUser> | null = await UserModel.findById(playerId)
        if (!user || user === null) {
            throw new Error('User not found')
        }

        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign || campaign === null) {
            throw new Error('Campaign not found')
        }

        if(!req.user) {
            res.status(401).json({error: 'Unauthorized'})
            return
        }

        if (campaign.owner.toString() !== req.user._id.toString()){
            res.status(401).json({error: 'Unauthorized'})
            return
        }

        if(campaign.maxSeats >= campaign.activePlayers.length){
            res.status(400).json({error: 'Max seats reached'})
            return
        }


        const player = campaign.playerQueue.find(player =>
            player.slug.toString() === user.slug || player.username.toString() === user.username || player.email.toString() === user.email
        )
        if (!player || player === null) {
            throw new Error('Player not found')
        }

        campaign.playerQueue.splice(campaign.playerQueue.indexOf(player), 1)
        if (campaign.activePlayers.map(activePlayer => activePlayer._id.toString()).includes(player._id.toString()))
            campaign.activePlayers = campaign.activePlayers.filter(activePlayer => activePlayer._id.toString() !== player._id.toString())
        campaign.activePlayers.push(player)
        await campaign.save()

        console.log(player)
        res.status(201).json(player)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({error: error.message})
        }
    }

}

/* async function getPlayers(req: Request, res: Response): Promise<void> {
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
}*/

