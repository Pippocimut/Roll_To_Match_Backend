import {NextFunction, Request, Response} from 'express'
import {UserModel} from '../database-models/User'
import {CampaignModel} from '../database-models/Campaign'
import {CampaignService} from 'services/CampaignService'
import {CandidateService} from 'services/CandidateService'
import {CreateCandidateDTO} from 'dto/CreateCandidateDTO'
import {CreateCandidateZodSchema} from 'dto/CreateCandidateDTO'
import PlayerAdapter from '../adapters/Player'

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

    public joinCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {campaignId} = req.params

            if (req.user === undefined) {
                throw new Error('Unauthorized')
            }

            const userId = req.user._id.toString()

            const user = await UserModel.findById(userId)
            if (!user) {
                throw new Error('User not found')
            }

            const campaign = await this.campaignService.getCampaign(campaignId)
            if (!campaign) {
                throw new Error('Campaign not found')
            }
            const player = await this.candidateService.createCandidate(campaign._id.toString(), user)

            const adaptedPlayer = PlayerAdapter.fromPersistedToReturnedPlayer(player)

            res.status(201).send(adaptedPlayer)
        } catch (error) {
            console.log("I'm here")
            return next(error)
        }
    }

    public static getCandidatePlayers = getCandidatePlayers
    public static getCandidatePlayer = getCandidatePlayer
    public deleteCandidatePlayer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {campaignId, playerId} = req.params

            if (req.user === undefined) {
                throw new Error('Unauthorized')
            }

            const userId = req.user._id.toString()

            const campaign = await this.campaignService.getCampaign(campaignId)
            if (!campaign) {
                throw new Error('Campaign not found')
            }
            const isPlayerOwner = campaign.owner.toString() === userId.toString()
            const isPlayerInQueue = campaign.playerQueue.find(player => player._id.toString() === playerId)
            const isPlayerActive = campaign.activePlayers.find(player => player._id.toString() === playerId)

            if (!isPlayerOwner && !isPlayerActive && !isPlayerInQueue) {
                throw new Error('Unauthorized')
            }

            const candidate = await this.candidateService.deleteCandidate(campaignId, playerId)

            res.json({message: 'Player removed'})
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({error: error.message})
            }
        }
    }
}

async function getCandidatePlayers(req: Request, res: Response): Promise<void> {
    try {
        const {campaignId} = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }
        res.json(campaign.playerQueue)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({error: error.message})
        }
    }
}

async function getCandidatePlayer(req: Request, res: Response): Promise<void> {
    try {
        const {campaignId, playerId} = req.params
        const campaign = await CampaignModel.findById(campaignId)
        if (!campaign) {
            throw new Error('Campaign not found')
        }

        const player = campaign.playerQueue.find(player => player._id.toString() === playerId)
        if (!player) {
            throw new Error('Player not found')
        }

        res.json(player)
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({error: error.message})
        }
    }
}