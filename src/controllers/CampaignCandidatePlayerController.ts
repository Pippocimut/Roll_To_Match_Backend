import { NextFunction, Request, Response } from 'express'
import { UserModel } from '../database-models/User'
import { CampaignModel } from '../database-models/Campaign'
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
    public createCandidatePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { campaignId } = req.params
            const userId = req.userId

            const user = await UserModel.findById(userId)
            if (!user) {
                throw new Error('User not found')
            }

            const candidateDTO: CreateCandidateDTO = CreateCandidateZodSchema.parse({
                email: user.email,
                slug: user.slug,
                id: user._id.toString(),
                username: user.username
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
    public deleteCandidatePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { campaignId, playerId } = req.params
            const userId = req.userId
            const campaign = await CampaignModel.findById(campaignId)
            if (!campaign) {
                throw new Error('Campaign not found')
            }

            const isPlayerOwner = campaign.owner.toString() === userId.toString()
            const isPlayerInQueue = campaign.playerQueue.find(player => player.id.toString() === playerId)
            const isPlayerActive = campaign.activePlayers.find(player => player.id.toString() === playerId)
    
            if (!isPlayerOwner && !isPlayerActive && !isPlayerInQueue) {
                throw new Error('Unauthorized')
            }
    
            const candidate = await this.candidateService.deleteCandidate(campaignId, playerId)
            
            res.json({ message: 'Player removed' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
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