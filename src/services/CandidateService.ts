import { CampaignModel, PersistedCampaign } from "../database-models/Campaign";
import { CreateCampaignDTO } from "../dto/CreateCampaignDTO";
import { SearchCampaignDTO } from "../dto/SearchCampaignDTO";
import { UpdateCampaignDTO } from "../dto/UpdateCampaignDTO";
import { UserCheckDTO } from "../dto/UserCheckDTO";
import { MongoDocument } from "../data-types";
import { UserModel } from "database-models/User";
import { PersistedPlayer } from "database-models/Player";

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

    public async createCandidate(candidate: CreateCandidateDTO, user: UserCheckDTO): Promise<MongoDocument<PersistedCampaign>> {
        const player: PersistedPlayer = {
            id: user.user._id,
            slug: user.user.slug,
            email: user.user.email
        }
        const newCandidate = this.campaignModel.updateOne({
            _id: ObjectId(candidate.campaignId)
        }, {
            $push: { playerQueue: player }
        });

        return newCandidate.save();
    }
}