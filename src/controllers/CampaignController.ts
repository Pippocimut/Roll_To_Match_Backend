import {CreateCampaignDTO, CreateCampaignZodSchema} from "../dto/CreateCampaignDTO";
import {UpdateCampaignDTO, UpdateCampaignZodSchema} from "../dto/UpdateCampaignDTO";
import {SearchCampaignDTO, SearchCampaignZodSchema} from "../dto/SearchCampaignDTO";
import {Client} from "@googlemaps/google-maps-services-js"
import {CampaignService} from "../services/CampaignService";
import CampaignAdapter from "../adapters/Campaign";
import {Request, Response} from "express";
import {CampaignModel, RoomModel} from "@roll-to-match/models";
import {RoomService} from "../services/RoomService";
import {Client as MinioClient} from "minio";

export class CampaignController {

    private static instance: CampaignController;
    private campaignService: CampaignService;
    private roomService: RoomService;
    private client : MinioClient;

    public static getInstance(): CampaignController {
        if (!CampaignController.instance) {
            CampaignController.instance = new CampaignController(new CampaignService(CampaignModel), new RoomService(RoomModel));
        }
        return CampaignController.instance;
    }

    public constructor(campaignService: CampaignService, roomService: RoomService) {
        this.campaignService = campaignService;
        this.roomService = roomService;
        this.client = new MinioClient({
            endPoint: '10.62.1.235',
            port: 9000,
            useSSL: true,
            accessKey: 'minioadmin',
            secretKey: 'minioadmin',
        })
    }

    public createCampaign = async (req: Request, res: Response): Promise<void> => {
        try {
            const campaignData = req.body;

            const parseCampaignDTO = CreateCampaignZodSchema.safeParse(campaignData)

            if (!parseCampaignDTO.success) {
                res.status(400).send(parseCampaignDTO.error.message);
                return
            }

            const campaignDTO: CreateCampaignDTO = parseCampaignDTO.data

            if (!req.user) {
                res.status(401).send('Unauthorized');
                return;
            }

            const userId = req.user._id.toString()
            const room = await this.roomService.createRandomRoom(userId);
            const roomId = room._id.toString()

            const campaign = await this.campaignService.createCampaign(campaignDTO, roomId, userId)
            const adaptedCampaign = CampaignAdapter.fromPersistedToReturnedCampaign(campaign)

            res.status(200).send(adaptedCampaign)
        } catch (err) {
            if (err instanceof Error) {
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    public getCampaigns = async (req: Request, res: Response): Promise<void> => {
        try {
            let userId = '';
            if (req.user) {
                userId = req.user._id.toString()
                return;
            }

            const query = req.query
            const searchParamsDTOResult = SearchCampaignZodSchema.safeParse(query)
            if (!searchParamsDTOResult.success) {
                res.status(400).send(searchParamsDTOResult.error.message);
                return
            }

            const searchParamsDTO = searchParamsDTOResult.data
            const result = await this.campaignService.getCampaigns(searchParamsDTO)//, userCheckDTO.id)
            const adaptedCampaigns = result.campaigns.map(CampaignAdapter.fromPersistedToReturnedCampaign)
            const sendBack = {
                pagination: result.pagination,
                campaigns: adaptedCampaigns,
            }
            res.status(200).send(sendBack)

        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({error: err.message})
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    public getCampaign = async (req: Request, res: Response): Promise<void> => {
        try {
            let userId = '';
            if (req.user) {
                userId = req.user._id.toString()
                return;
            }

            const campaign = await this.campaignService.getCampaign(req.params.id)
            if (!campaign) {
                res.status(404).send('Campaign not found')
                return
            }
            res.status(200).send(CampaignAdapter.fromPersistedToReturnedCampaign(campaign))
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({error: err.message})
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    public updateCampaign = async (req: Request, res: Response): Promise<void> => {
        try {
            const updateCampaignDTO: UpdateCampaignDTO = UpdateCampaignZodSchema.parse(req.body)

            const campaign = await this.campaignService.getCampaign(req.params.id)
            const user = req.user

            if (!user) {
                res.status(401).send({message: 'Unauthorized'})
                return
            }

            if (!campaign){
                res.status(404).send({message: 'Campaign not found'})
                return
            }

            if (campaign.owner && campaign.owner.toString() !== user._id.toString()) {
                res.status(401).send({message: 'Unauthorized'})
                return
            }

            const campaignUpdateResult = await this.campaignService.updateCampaign(req.params.id, updateCampaignDTO)
            res.status(200).send(campaignUpdateResult);
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({error: err.message})
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    public deleteCampaign = async(req: Request, res: Response): Promise<void> => {
        try {
            const campaign = await this.campaignService.getCampaign(req.params.id)
            const user = req.user

            if (!user) {
                res.status(401).send({message: 'Unauthorized'})
                return
            }

            if (!campaign){
                res.status(404).send({message: 'Campaign not found'})
                return
            }

            if (campaign.owner && campaign.owner.toString() !== user.id) {
                res.status(401).send({message: 'Unauthorized'})
                return
            }

            const campaignUpdateResult = await this.campaignService.deleteCampaign(req.params.id)
            res.status(200).send(campaignUpdateResult);
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({error: err.message})
                this.CampaignControllerHandleError(err, res)
            }
        }
    }

    private CampaignControllerHandleError = (err: Error, res: Response): void => {
        console.error(err)
        switch (err.name) {
            case 'ValidationError':
                res.status(400).send({message: err.message})
                break;
            case 'UnauthorizedError':
                res.status(401).send({message: err.message})
                break;
            default:
                res.status(500).send({message: 'Internal server error'})
                break;
        }
    }
}