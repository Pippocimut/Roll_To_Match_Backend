import { CampaignModel } from "@roll-to-match/models";
import { describe, it } from "@jest/globals";
import { CampaignService } from "@roll-to-match/services";
import { getCreateCampaignDTO } from "@roll-to-match/dto-test/mock/MockCreateCampaignDTO"
import { getMockCampaign } from "@roll-to-match/models-test/mock/MockCampaign"
import 'dotenv/config';

const { ObjectId, DocumentArray } = require('mongoose').Types;

describe('CampaignService', () => {
    describe('integration tests', () => {
        const service = new CampaignService(CampaignModel);

        describe('when creating a campaign', () => {
            describe('and the data is valid', () => {
                it('should create a campaign', async () => {
                    const dto = getCreateCampaignDTO({})
                    jest.spyOn(CampaignModel, 'create').mockImplementationOnce(() => Promise.resolve(getMockCampaign({}) as any));

                    const campaign = await service.createCampaign(dto, new ObjectId().toString());
                })
            })
            describe('and the data is invalid', () => {
                it('should throw an error database validation fails', async () => {
                    const dto = getCreateCampaignDTO({})

                    jest.spyOn(CampaignModel, 'create').mockImplementationOnce(() => { throw new Error() });

                    try {
                        const campaign = await service.createCampaign(dto, new ObjectId("").toString());
                    } catch (error) {
                        return
                    }
                    throw new Error();
                })

            })
        })
    })
});