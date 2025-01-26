import { CreateCampaignDTO, CreateCampaignZodSchema } from "../dto/CreateCampaignDTO";
import { UpdateCampaignDTO, UpdateCampaignZodSchema } from "../dto/UpdateCampaignDTO";
import { SearchCampaignDTO, SearchCampaignZodSchema } from "../dto/SearchCampaignDTO";
import { CampaignService } from "../services/CampaignService";
import CampaignAdapter from "../adapters/Campaign";
import { Request, Response } from "express";
import { CampaignModel } from "@roll-to-match/models";

export class CampaignController {

    private static instance: CampaignController;
    private campaignService: CampaignService;

    public static getInstance(): CampaignController {
        if (!CampaignController.instance) {
            CampaignController.instance = new CampaignController(new CampaignService(CampaignModel));
        }
        return CampaignController.instance;
    }

    public constructor(campaignService: CampaignService) {
        this.campaignService = campaignService;
    }

    public async createCampaign(req: Request, res: Response): Promise<void> {
        try {
            const campaignDTO: CreateCampaignDTO = CreateCampaignZodSchema.parse(req.body)
            if (!req.user) {
                res.status(401).send('Unauthorized');
                return;
            }
            if (!req.params.id) {
                res.status(400).send('Room ID not provided');
                return;
            }
            const userId = req.user._id.toString()
            const roomId = req.params.id

            const campaign = await this.campaignService.createCampaign(campaignDTO, roomId, userId)
            const adaptedCampaign = CampaignAdapter.fromPersistedToReturnedCampaign(campaign)

            res.status(200).send(adaptedCampaign)
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message })
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    public getCampaigns = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).send('Unauthorized');
                return;
            }
            const userId = req.user._id.toString()
            const searchParamsDTO: SearchCampaignDTO = SearchCampaignZodSchema.parse(req.query)
            const campaigns = await this.campaignService.getCampaigns(searchParamsDTO)//, userCheckDTO.id)
            const adaptedCampaigns = campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign)
            res.status(200).send(adaptedCampaigns)
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message })
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    public getCampaign = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).send('Unauthorized');
                return;
            }
            const userId = req.user._id.toString()
            const campaign = await this.campaignService.getCampaign(req.params.id)
            console.log(JSON.stringify(campaign))
            res.status(200).send(CampaignAdapter.fromPersistedToReturnedCampaign(campaign))
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message })
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    public async updateCampaign(req: Request, res: Response): Promise<void> {
        try {
            const updateCampaignDTO: UpdateCampaignDTO = UpdateCampaignZodSchema.parse(req.body)

            const campaign = await this.campaignService.getCampaign(req.params.id)
            const user = req.user

            if (!user) {
                res.status(401).send({ message: 'Unauthorized' })
                return
            }

            if (campaign.owner && campaign.owner.toString() !== user._id.toString()) {
                res.status(401).send({ message: 'Unauthorized' })
                return
            }

            const campaignUpdateResult = await this.campaignService.updateCampaign(req.params.id, updateCampaignDTO)
            res.status(200).send(campaignUpdateResult);
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message })
                this.CampaignControllerHandleError(err, res)
            }
        }
    }


    public async deleteCampaign(req: Request, res: Response): Promise<void> {
        try {
            const campaign = await this.campaignService.getCampaign(req.params.id)
            const user = req.user

            if (!user) {
                res.status(401).send({ message: 'Unauthorized' })
                return
            }

            if (campaign.owner && campaign.owner.toString() !== user.id) {
                res.status(401).send({ message: 'Unauthorized' })
                return
            }

            const campaignUpdateResult = await this.campaignService.deleteCampaign(req.params.id)
            res.status(200).send(campaignUpdateResult);
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message })
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    private CampaignControllerHandleError = (err: Error, res: Response): void => {
        console.error(err)
        switch (err.name) {
            case 'ValidationError':
                res.status(400).send({ message: err.message })
                break;
            case 'UnauthorizedError':
                res.status(401).send({ message: err.message })
                break;
            default:
                res.status(500).send({ message: 'Internal server error' })
                break;
        }
    }
}