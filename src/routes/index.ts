
import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { CampaignPlayerController } from '../controllers/CampaignPlayerController';
import { RoomCampaignController } from '../controllers/RoomCampaignController';
import { RoomController } from '../controllers/RoomController';
import { ReviewController } from '../controllers/ReviewController';

const router = Router();

router.post('/room', RoomController.createRoom);
router.get('/rooms', RoomController.getRooms);
router.get('/room/:id', RoomController.getRoom);
router.put('/room/:id', RoomController.updateRoom);
router.delete('/room/:id', RoomController.deleteRoom);

router.post('/room/:id/campaign', RoomCampaignController.createCampaign);
router.get('/room/:id/campaigns', RoomCampaignController.getCampaigns);

router.get('campaigns', CampaignController.getCampaign);
router.get('campaign/:id', CampaignController.getCampaign);
router.put('campaign/:id', CampaignController.updateCampaign);
router.delete('campaign/:id', CampaignController.deleteCampaign);

router.post('campaign/:id/review', ReviewController.createReview);
router.get('campaign/:id/reviews', ReviewController.getReviews);
router.get('campaign/:id/review/:id', ReviewController.getReview);
router.put('campaign/:id/review/:id', ReviewController.updateReview);
router.delete('campaign/:id/review/:id', ReviewController.deleteReview);

router.post('campaign/:campaignId/player', CampaignPlayerController.createPlayer);
router.get('campaign/:campaignId/players', CampaignPlayerController.getPlayers);
router.get('campaign/:campaignId/player/:playerId', CampaignPlayerController.getPlayer);
router.delete('campaign/:campaignId/player/:playerId', CampaignPlayerController.deletePlayer);

export default router;