import { CreateCampaignDTO, CreateCampaignZodSchema } from "@roll-to-match/dto";
import { UpdateCampaignDTO, UpdateCampaignZodSchema } from "@roll-to-match/dto";
import { SearchCampaignDTO, SearchCampaignZodSchema } from "@roll-to-match/dto";
import { CampaignService } from "@roll-to-match/services";
import CampaignAdapter from "../../adapters/Campaign";
import { NextFunction, Request, Response } from "express";
import { CampaignModel } from "@roll-to-match/models";

export class PageCampaignController {

    private static instance: PageCampaignController;
    private campaignService: CampaignService;

    public static getInstance(): PageCampaignController {
        if (!PageCampaignController.instance) {
            PageCampaignController.instance = new PageCampaignController(new CampaignService(CampaignModel));
        }
        return PageCampaignController.instance;
    }

    public constructor(campaignService: CampaignService) {
        this.campaignService = campaignService;
    }

    public getCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user._id.toString()
            const searchParamsDTO: SearchCampaignDTO = SearchCampaignZodSchema.parse(req.query)
            const campaigns = await this.campaignService.getCampaigns(searchParamsDTO)//, userCheckDTO.id)
            const adaptedCampaigns = campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign)
            res.status(200).render('pages/index', { campaigns: adaptedCampaigns, userId: userId });
        } catch (err) {
            next(err)
        }
    }

    public getCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user._id.toString()
            const campaign = await this.campaignService.getCampaign(req.params.id)
            console.log(JSON.stringify(campaign))
            res.status(200).render('pages/campaign', { campaign: CampaignAdapter.fromPersistedToReturnedCampaign(campaign), userId: userId });
        } catch (err) {
            next(err)
        }
    }
}