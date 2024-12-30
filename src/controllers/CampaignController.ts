import { CreateCampaignDTO, CreateCampaignZodSchema } from "../dto/CreateCampaignDTO";
import { UpdateCampaignDTO, UpdateCampaignZodSchema } from "../dto/UpdateCampaignDTO";
import { UserCheckDTO, UserCheckZodSchema } from "../dto/UserCheckDTO";
import { SearchCampaignDTO, SearchCampaignZodSchema } from "../dto/SearchCampaignDTO";
import { CampaignService } from "../services/CampaignService";
import CampaignAdapter from "../adapters/Campaign";
import { Request, Response } from "express";
import { CampaignCheckDTO, CampaignCheckZodSchema } from "../dto/CampaignCheckDTO";

export class CampaignController {

    private static instance: CampaignController;
    private campaignService: CampaignService;

    public static getInstance(): CampaignController {
        if (!CampaignController.instance) {
            CampaignController.instance = new CampaignController(new CampaignService());
        }
        return CampaignController.instance;
    }

    public constructor(campaignService: CampaignService) {
        this.campaignService = campaignService;
    }

    public async createCampaign(req: Request, res: Response): Promise<void> {
        const campaignDTO: CreateCampaignDTO = CreateCampaignZodSchema.parse(req.body)
        const userCheckDTO: UserCheckDTO = UserCheckZodSchema.parse({ id: req.user })

        try {
            const campaign = await this.campaignService.createCampaign(campaignDTO, userCheckDTO)
            res.status(201).send(CampaignAdapter.fromPersistedToReturnedCampaign(campaign));
        } catch (err) {
            this.CampaignControllerHandleError(err, res)
        }
    }

    public async getCampaigns(req: Request & { user: string }, res: Response): Promise<void> {
        const searchParamsDTO: SearchCampaignDTO = SearchCampaignZodSchema.parse(req.query)
        const userCheckDTO: UserCheckDTO = UserCheckZodSchema.parse({ id: req.user })

        try {
            const campaigns = await this.campaignService.getCampaigns(searchParamsDTO, userCheckDTO.id)
            res.status(200).send(campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign));
        } catch (err) {
            this.CampaignControllerHandleError(err, res)
        }
    }

    public async getCampaign(req: Request, res: Response): Promise<void> {
        const campaignCheckDTO: CampaignCheckDTO = CampaignCheckZodSchema.parse(req.params)

        try {
            const campaign = await this.campaignService.getCampaign(req.params.id)
            res.status(200).send(CampaignAdapter.fromPersistedToReturnedCampaign(campaign));
        } catch (err) {
            this.CampaignControllerHandleError(err, res)
        }
    }

    public async updateCampaign(req: Request, res: Response): Promise<void> {
        const updateCampaignDTO: UpdateCampaignDTO = UpdateCampaignZodSchema.parse(req.body)
        const userCheckDTO: UserCheckDTO = UserCheckZodSchema.parse({ id: req.user })
        const campaignCheckDTO: CampaignCheckDTO = CampaignCheckZodSchema.parse(req.params)

        if (campaignCheckDTO.campaign.owner && campaignCheckDTO.campaign.owner.toString() !== userCheckDTO.id) {
            res.status(401).send({ message: 'Unauthorized' })
            return
        }

        try {
            const campaign = await this.campaignService.updateCampaign(req.params.id, updateCampaignDTO)
            res.status(200).send(campaign);
        }
        catch (err) {
            this.CampaignControllerHandleError(err, res)
        }
    }


    public async deleteCampaign(req: Request, res: Response): Promise<void> {
        const userCheckDTO: UserCheckDTO = UserCheckZodSchema.parse({ id: req.user })
        const campaignCheckDTO: CampaignCheckDTO = CampaignCheckZodSchema.parse(req.params)

        if (campaignCheckDTO.campaign.owner && campaignCheckDTO.campaign.owner.toString() !== userCheckDTO.id) {
            res.status(401).send({ message: 'Unauthorized' })
            return
        }

        try {
            const campaign = await this.campaignService.deleteCampaign(req.params.id)
            res.status(200).send(campaign);
        }
        catch (err) {
            this.CampaignControllerHandleError(err, res)
        }
    }

    private CampaignControllerHandleError(err: any, res: Response) {
        switch (err.name) {
            case 'ValidationError':
                res.status(400).send({ message: err.message })
                break;
            case 'AuthorizationError':
                res.status(401).send({ message: err.message })
                break;
            default:
                res.status(500).send({ message: 'Internal server error' })
                break;
        }
        console.error(err)
    }
}