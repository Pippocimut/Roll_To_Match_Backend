import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { MongoDocument } from "../data-types";
import { PersistedPlayer } from "database-models/Player";
import { CreateCandidateDTO } from "dto/CreateCandidateDTO";
import { UpdateWriteOpResult } from "mongoose";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export interface ICandidateService {
    createCandidate(campaignId: string, candidate: CreateCandidateDTO): Promise<UpdateWriteOpResult>;
    deleteCandidate(campaignId: string, candidateId: string): Promise<UpdateWriteOpResult>;
}

export class CandidateService implements ICandidateService {
    constructor(private campaignModel: typeof CampaignModel) { }

    public async createCandidate(campaignId: string, candidate: CreateCandidateDTO): Promise<UpdateWriteOpResult> {
        const player: PersistedPlayer = {
            id: new ObjectId(candidate.id),
            slug: candidate.slug,
            email: candidate.email,
            username: candidate.username
        }

        const campaign = await this.campaignModel.findById(campaignId).exec();
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        if (campaign.playerQueue.some((player) => player.id.toString() === candidate.id.toString())) {
            throw new Error('Candidate already exists');
        }

        const newCandidate = await this.campaignModel.updateOne({
            _id: new ObjectId(campaignId)
        }, {
            $push: { playerQueue: player }
        }).exec();
        
        return newCandidate
    }

    public async deleteCandidate(campaignId: string, candidateId: string): Promise<UpdateWriteOpResult> {
        const campaign = await this.campaignModel.findById(campaignId).exec();
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const newCampaign = await this.campaignModel.updateOne({
            _id: new ObjectId(campaignId)
        }, {
            $pull: { playerQueue: { id: new ObjectId(candidateId) }, activePlayers: { id: new ObjectId(candidateId) } }
        }).exec();

        return newCampaign
    }
}