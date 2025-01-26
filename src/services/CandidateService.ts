import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { MongoDocument } from "../data-types";
import { PersistedUser } from "../database-models/User";
import { CreateCandidateDTO } from "dto/CreateCandidateDTO";
import { UpdateWriteOpResult } from "mongoose";

const { ObjectId, DocumentArray } = require('mongoose').Types;

export interface ICandidateService {
    createCandidate(campaignId: string, candidate: CreateCandidateDTO): Promise<MongoDocument<PersistedUser>>;
    deleteCandidate(campaignId: string, candidateId: string): Promise<UpdateWriteOpResult>;
}

export class CandidateService implements ICandidateService {
    constructor(private campaignModel: typeof CampaignModel) { }

    public async createCandidate(campaignId: string, candidate: MongoDocument<PersistedUser>): Promise<MongoDocument<PersistedUser>> {
        

        const campaign = await this.campaignModel.findById(campaignId).exec();
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const updateResult = await this.campaignModel.updateOne({
            _id: new ObjectId(campaignId)
        }, {
            $addToSet: { playerQueue: { $each: [candidate] } }
        }).exec();

        const updatedCampaign = await this.campaignModel.findById(campaignId).exec();
        if (!updatedCampaign) {
            throw new Error('Campaign not found');
        }

        const user = updatedCampaign.playerQueue.find(player => player._id.toString() === candidate._id.toString());
        if (!user) {
            throw new Error('User not found');
        }
        
        return user
    }

    public async deleteCandidate(campaignId: string, candidateId: string): Promise<UpdateWriteOpResult> {
        const campaign = await this.campaignModel.findById(campaignId).exec();
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const newCampaign = await this.campaignModel.updateOne({
            _id: new ObjectId(campaignId)
        }, {
            $pull: { playerQueue: { _id: new ObjectId(candidateId) }, activePlayers: { _id: new ObjectId(candidateId) } }
        }).exec();

        return newCampaign
    }
}