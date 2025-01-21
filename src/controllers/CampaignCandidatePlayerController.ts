import { NextFunction, Request, Response } from 'express'
import { PersistedUser, UserModel } from '../database-models/User'
import { MongoDocument } from '../data-types'
import { PersistedPlayer } from '../database-models/Player'
import { CampaignModel } from '../database-models/Campaign'
import { UserCheckDTO, UserCheckZodSchema } from 'dto/UserCheckDTO'
import { CampaignService } from 'services/CampaignService'
import { CandidateService } from 'services/CandidateService'
import { CreateCandidateDTO } from 'dto/CreateCandidateDTO'
import { CreateCandidateZodSchema } from 'dto/CreateCandidateDTO'

export class CampaignCandidatePlayerController {
    private static instance: CampaignCandidatePlayerController;
    private campaignService: CampaignService;
    private candidateService: CandidateService;

    private constructor(campaignService: CampaignService, candidateService: CandidateService) {
        this.campaignService = campaignService;
        this.candidateService = candidateService
    }

    public static getInstance(): CampaignCandidatePlayerController {
        if (!CampaignCandidatePlayerController.instance) {
            CampaignCandidatePlayerController.instance = new CampaignCandidatePlayerController(new CampaignService(CampaignModel), new CandidateService(CampaignModel));
        }
        return CampaignCandidatePlayerController.instance;
    }
    public createCandidatePlayer = async (req: Request & { user: any }, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { campaignId } = req.params
            const userId = req.user.id
            const userDTO: UserCheckDTO = await UserCheckZodSchema.parseAsync({ id: userId })

            const candidateDTO: CreateCandidateDTO = CreateCandidateZodSchema.parse({
                email: userDTO.user.email,
                slug: userDTO.user.slug,
                id: userDTO.id
            })

            const campaign = await this.campaignService.getCampaign(campaignId)
            const player = await this.candidateService.createCandidate(campaign._id.toString(), candidateDTO)

            res.status(201).redirect(`/campaign/${campaignId}`)
        } catch (error) {
            return next(error)
        }
    }

    public static getCandidatePlayers = getCandidatePlayers
    public static getCandidatePlayer = getCandidatePlayer
    public static deleteCandidatePlayer = deleteCandidatePlayer
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