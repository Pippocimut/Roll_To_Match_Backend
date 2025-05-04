
import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { CampaignPlayerController } from '../controllers/CampaignPlayerController';
import { CampaignCandidatePlayerController } from 'controllers/CampaignCandidatePlayerController';
import multer from "multer";

const router = Router();

var upload = multer({ dest: './uploads'});

router.get('/campaigns', CampaignController.getInstance().getCampaigns);
router.post('/campaign', CampaignController.getInstance().createCampaign);

router.get('/campaign/:id', CampaignController.getInstance().getCampaign);
router.patch('/campaign/:id', CampaignController.getInstance().updateCampaign);
router.delete('/campaign/:id', CampaignController.getInstance().deleteCampaign);

router.post('/campaign/:campaignId/join', CampaignCandidatePlayerController.getInstance().createCandidatePlayer);
router.delete('/campaign/:campaignId/player/:playerId', CampaignCandidatePlayerController.getInstance().deleteCandidatePlayer);

router.post('/campaign/:campaignId/player/:playerId', CampaignPlayerController.createPlayer);
router.delete('/campaign/:campaignId/active-player/:playerId', CampaignPlayerController.kickPlayer);

export default router;