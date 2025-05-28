import {NextFunction, Request, Response} from 'express'
import {PersistedUser, UserModel, CampaignModel} from '@roll-to-match/models'
import {MongoDocument} from '../data-types'

export class CampaignPlayerController {
    private static instance: CampaignPlayerController;

    private constructor() {
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new CampaignPlayerController()
        }
        return this.instance
    }

    public createPlayer = createPlayer
    public kickPlayer = deletePlayer
}

async function deletePlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
        res.status(401).json({error: 'Unauthorized'})
        return
    }

    const {campaignId, playerId} = req.params

    const campaign = await CampaignModel.findById(campaignId)
    if (!campaign) {
        res.status(404).json({error: 'Campaign not found'})
        return
    }

    if (campaign.owner.toString() !== req.user._id.toString()) {
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
    res.status(200).json({message: 'Player removed'})
}

async function createPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {

    if (!req.user) {
        res.status(401).json({error: 'Unauthorized'})
        return
    }

    const {campaignId, playerId} = req.params

    const player: MongoDocument<PersistedUser> | null = await UserModel.findById(playerId)
    const campaign = await CampaignModel.findById(campaignId)

    if (!player) {
        res.status(404).json({error: 'Player not found'})
        return
    }

    if (!campaign) {
        res.status(404).json({error: 'Campaign not found'})
        return
    }

    if (campaign.owner.toString() !== req.user._id.toString()) {
        res.status(401).json({error: 'Unauthorized'})
        return
    }

    if (campaign.owner.toString() === player._id.toString()) {
        res.status(400).json({error: 'Cannot join campaign owner'})
        return
    }

    if (campaign.maxSeats <= campaign.activePlayers.length) {
        res.status(400).json({error: 'Max seats reached'})
        return
    }

    const playerInQueue = campaign.playerQueue.find(player =>
        player.slug.toString() === player.slug || player.username.toString() === player.username || player.email.toString() === player.email
    )
    if (!playerInQueue || playerInQueue === null) {
        res.status(400).json({error: 'Player not found'})
        return
    }

    campaign.playerQueue.splice(campaign.playerQueue.indexOf(playerInQueue), 1)
    if (campaign.activePlayers.map(activePlayer => activePlayer._id.toString()).includes(playerInQueue._id.toString()))
        campaign.activePlayers = campaign.activePlayers.filter(activePlayer => activePlayer._id.toString() !== playerInQueue._id.toString())
    campaign.activePlayers.push(playerInQueue)
    await campaign.save()

    res.status(201).json(playerInQueue)

}