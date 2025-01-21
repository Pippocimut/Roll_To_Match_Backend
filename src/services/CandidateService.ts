import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { CreateCampaignDTO } from "../dto/CreateCampaignDTO";
import { SearchCampaignDTO } from "../dto/SearchCampaignDTO";
import { UpdateCampaignDTO } from "../dto/UpdateCampaignDTO";
import { UserCheckDTO } from "../dto/UserCheckDTO";
import { MongoDocument } from "../data-types";
import { PersistedPlayer } from "database-models/Player";
import { CreateCandidateDTO } from "dto/CreateCandidateDTO";
import { UpdateWriteOpResult } from "mongoose";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export interface ICandidateService {
    createCandidate(candidate: CreateCampaignDTO, user: UserCheckDTO): Promise<MongoDocument<PersistedCampaign>>;
    getCandidates(searchParams: SearchCampaignDTO): Promise<MongoDocument<PersistedCampaign>[]>;
    getCandidate(candidateId: string): Promise<MongoDocument<PersistedCampaign>>;
    updateCandidate(candidateId: string, candidate: UpdateCampaignDTO): Promise<MongoDocument<PersistedCampaign>>;
    deleteCandidate(candidateId: string): Promise<MongoDocument<PersistedCampaign>>;
}

export class CandidateService {
    constructor(private campaignModel: typeof CampaignModel) { }

    public async createCandidate(campaignId: string, candidate: CreateCandidateDTO): Promise<UpdateWriteOpResult | null> {
        const player: PersistedPlayer = {
            id: new ObjectId(candidate.id),
            slug: candidate.slug,
            email: candidate.email
        }

        const campaign = await this.campaignModel.findById(campaignId).exec();
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        if (campaign.playerQueue.some((player) => player.id.toString() === candidate.id.toString())) {
            return null
        }

        const newCandidate = await this.campaignModel.updateOne({
            _id: new ObjectId(campaignId)
        }, {
            $push: { playerQueue: player }
        }).exec();

        return newCandidate
    }
}