import { SearchCampaignDTO, SearchCampaignZodSchema } from "@roll-to-match/dto";
import { CampaignService } from "@roll-to-match/services";
import CampaignAdapter from "../../adapters/Campaign";
import { NextFunction, query, Request, Response } from "express";
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

    public getRoomCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.user === undefined) {
                throw new Error('Unauthorized')
            }
            const userId = req.user._id.toString()
            const searchParamsDTO: SearchCampaignDTO = SearchCampaignZodSchema.parse(req.query)

            const searchParams = {
                ...searchParamsDTO,
                filter: {
                    location: searchParamsDTO.location || { lat: 0, lng: 0, radius: 10000 },
                    room: req.params.id
                }
            }

            const campaigns = await this.campaignService.getCampaigns(searchParams)//, userCheckDTO.id)
            const adaptedCampaigns = campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign)
            res.status(200).render('pages/campaigns', { campaigns: adaptedCampaigns, userId: userId });
        } catch (err) {
            next(err)
        }
    }

    public getMyCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.user === undefined) {
                throw new Error('Unauthorized')
            }
            const userId = req.user._id.toString()
            const searchParamsDTO: SearchCampaignDTO = SearchCampaignZodSchema.parse(req.query)

            const searchParams = {
                ...searchParamsDTO,
                filter: {
                    location: searchParamsDTO.location || { lat: 0, lng: 0, radius: 10000 },
                    owner: userId
                }
            }

            const campaigns = await this.campaignService.getCampaigns(searchParams)//, userCheckDTO.id)
            const adaptedCampaigns = campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign)
            res.status(200).render('pages/campaigns', { campaigns: adaptedCampaigns, userId: userId });
        } catch (err) {
            next(err)
        }
    }

    public getCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.user === undefined) {
                throw new Error('Unauthorized')
            }
            const userId = req.user._id.toString()
            const queryParam = JSON.parse(JSON.stringify(req.query)) || '{}'
            for (const key in queryParam) {
                if (queryParam[key] === '') {
                    delete queryParam[key]
                } else {
                    queryParam[key] = JSON.parse(JSON.stringify(queryParam[key]))
                }
            }

            console.log(queryParam)

            const searchParamsDTO: SearchCampaignDTO = SearchCampaignZodSchema.parse(queryParam)
            console.log(searchParamsDTO)
            const campaigns = await this.campaignService.getCampaigns(searchParamsDTO)//, userCheckDTO.id)
            const adaptedCampaigns = campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign)
            res.status(200).render('pages/campaigns', { campaigns: adaptedCampaigns, userId: userId });
        } catch (err) {
            next(err)
        }
    }

    public getCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.user === undefined) {
                throw new Error('Unauthorized')
            }
            const userId = req.user._id.toString()
            const campaign = await this.campaignService.getCampaign(req.params.id)
            console.log(JSON.stringify(campaign))
            res.status(200).render('pages/campaign', { campaign: CampaignAdapter.fromPersistedToReturnedCampaign(campaign), userId: userId });
        } catch (err) {
            next(err)
        }
    }
}