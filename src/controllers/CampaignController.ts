import {CreateCampaignDTO, CreateCampaignZodSchema} from "../dto/CreateCampaignDTO";
import {UpdateCampaignZodSchema} from "../dto/UpdateCampaignDTO";
import {SearchCampaignZodSchema} from "../dto/SearchCampaignDTO";
import {CampaignService} from "../services/CampaignService";
import CampaignAdapter from "../adapters/Campaign";
import {NextFunction, Request, Response} from "express";
import {CampaignModel, RoomModel} from "@roll-to-match/models";
import {RoomService} from "../services/RoomService";

export class CampaignController {

    private static instance: CampaignController;
    private campaignService: CampaignService;
    private roomService: RoomService;

    public static getInstance(): CampaignController {
        if (!CampaignController.instance) {
            CampaignController.instance = new CampaignController(new CampaignService(CampaignModel), new RoomService(RoomModel));
        }
        return CampaignController.instance;
    }

    public constructor(campaignService: CampaignService, roomService: RoomService) {
        this.campaignService = campaignService;
        this.roomService = roomService;
    }

    public createCampaign = async (req: Request, res: Response): Promise<void> => {
        if (!req.user) {
            res.status(401).json('Unauthorized');
            return;
        }

        const campaignData = req.body;

        const parseCampaignDTO = CreateCampaignZodSchema.safeParse(campaignData)

        if (!parseCampaignDTO.success) {
            res.status(400).json(parseCampaignDTO.error.message);
            return
        }

        const campaignDTO: CreateCampaignDTO = parseCampaignDTO.data

        const userId = req.user._id.toString()
        const room = await this.roomService.createRandomRoom(userId);
        const roomId = room._id.toString()

        const campaign = await this.campaignService.createCampaign(campaignDTO, roomId, userId)

        if (!campaign) {
            res.status(500).json('Internal server error');
            return;
        }

        const adaptedCampaign = CampaignAdapter.fromPersistedToReturnedCampaign(campaign)

        res.status(201).json(adaptedCampaign)
    }

    public getCampaigns = async (req: Request, res: Response): Promise<void> => {

        const query = req.query
        const searchParamsDTOResult = SearchCampaignZodSchema.safeParse(query)
        if (!searchParamsDTOResult.success) {
            res.status(400).json(searchParamsDTOResult.error.message);
            return
        }

        const searchParamsDTO = searchParamsDTOResult.data
        const result = await this.campaignService.getCampaigns(searchParamsDTO)

        const adaptedCampaigns = result.campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign)

        const sendBack = {
            pagination: result.pagination,
            campaigns: adaptedCampaigns,
        }
        res.status(200).json(sendBack)

    }

    public getCampaign = async (req: Request, res: Response): Promise<void> => {
        const campaign = await this.campaignService.getCampaign(req.params.id)
        if (!campaign) {
            console.log("Campaign not found")
            res.status(404).json('Campaign not found')
            return
        }

        res.status(200).json(CampaignAdapter.fromPersistedToReturnedCampaign(campaign))

    }

    public updateCampaign = async (req: Request, res: Response): Promise<void> => {
        const user = req.user
        if (!user) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        const campaign = await this.campaignService.getCampaign(req.params.id)

        if (!campaign) {
            res.status(404).json({message: 'Campaign not found'})
            return
        }

        if (campaign.owner && campaign.owner._id.toString() !== user._id.toString()) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        const updateCampaignDTOFetch = UpdateCampaignZodSchema.safeParse(req.body)
        if (updateCampaignDTOFetch.success === false) {
            res.status(400).json(updateCampaignDTOFetch.error.message);
            return
        }

        const updateCampaignDTO = updateCampaignDTOFetch.data

        const campaignUpdateResult = await this.campaignService.updateCampaign(req.params.id, updateCampaignDTO)
        res.status(200).json(campaignUpdateResult);

    }

    public deleteCampaign = async (req: Request, res: Response): Promise<void> => {
        const user = req.user
        if (!user) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        const campaign = await this.campaignService.getCampaign(req.params.id)

        if (!user) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        if (!campaign) {
            res.status(404).json({message: 'Campaign not found'})
            return
        }

        if (campaign.owner && campaign.owner._id.toString() !== user._id.toString()) {
            res.status(401).json({message: 'Unauthorized'})
            return
        }

        const campaignUpdateResult = await this.campaignService.deleteCampaign(req.params.id)
        res.status(200).json(campaignUpdateResult);
    }
}