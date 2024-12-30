import { ICampaignService } from '../CampaignService';
import { jest } from '@jest/globals'
type MockCampaignService = jest.Mocked<ICampaignService>


export function getMockCampaignService(): MockCampaignService {
  return {
    createCampaign: jest.fn(),
    getCampaigns: jest.fn(),
    getCampaign: jest.fn(),
    updateCampaign: jest.fn(),
    deleteCampaign: jest.fn(),
  };
}

export function resetMockCampaignService(service: MockCampaignService): void {
  service.createCampaign.mockReset();
  service.getCampaigns.mockReset();
  service.getCampaign.mockReset();
  service.updateCampaign.mockReset();
  service.deleteCampaign.mockReset();
}