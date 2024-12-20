
import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';

const router = Router();


router.post('/room', CampaignController.createCampaign);
router.get('/rooms', CampaignController.getCampaigns);
router.get('/room/:id', CampaignController.getCampaign);
router.put('/room/:id', CampaignController.updateCampaign);
router.delete('/room/:id', CampaignController.deleteCampaign);

router.post('/room/:id/campaign', CampaignController.createCampaign);
router.get('/room/:id/campaigns', CampaignController.getCampaigns);
router.get('/room/:id/campaign/:id', CampaignController.getCampaign);
router.put('/room/:id/campaign/:id', CampaignController.updateCampaign);
router.delete('/room/:id/campaign/:id', CampaignController.deleteCampaign);
