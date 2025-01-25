
import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
//import { CampaignPlayerController } from '../controllers/CampaignPlayerController';
import { RoomCampaignController } from '../controllers/RoomCampaignController';
import { RoomController } from '../controllers/RoomController';
import { ReviewController } from '../controllers/ReviewController';
import { CampaignCandidatePlayerController } from 'controllers/CampaignCandidatePlayerController';
import { PageCampaignController } from '../controllers/WebControllers/PageCampaignController';
import { PageRoomController } from '../controllers/WebControllers/PageRoomController';

const router = Router();

router.get('/', CampaignController.getInstance().getCampaigns);
router.get('/create-campaign/:id', (req, res) => { res.render('pages/create-campaign', { roomId: req.params.id }); });
router.get('/create-room', (req, res) => { res.render('pages/create-room'); });
router.get('/campaign/:id', PageCampaignController.getInstance().getCampaign);
router.get('/room/:id', PageRoomController.getInstance().getRoom);
router.get('/room/:id/campaigns', PageCampaignController.getInstance().getCampaigns);

router.get('/api/v1/campaigns', CampaignController.getInstance().getCampaigns);
router.get('/api/v1/campaign/:id', CampaignController.getInstance().getCampaign);

router.post('/api/v1/room', RoomController.createRoom);
router.get('/api/v1/rooms', RoomController.getRooms);
router.get('/api/v1/room/:id', RoomController.getRoom);
router.put('/api/v1/room/:id', RoomController.updateRoom);
router.delete('/api/v1/room/:id', RoomController.deleteRoom);

router.post('/api/v1/room/:id/campaign', RoomCampaignController.createCampaign);
router.get('/api/v1/room/:id/campaigns', RoomCampaignController.getCampaigns);

router.put('/api/v1/campaign/:id', CampaignController.getInstance().updateCampaign);
router.delete('/api/v1/campaign/:id', CampaignController.getInstance().deleteCampaign);

router.post('/api/v1/campaign/:id/review', ReviewController.createReview);
router.get('/api/v1/campaign/:id/reviews', ReviewController.getReviews);
router.get('/api/v1/campaign/:id/review/:id', ReviewController.getReview);
router.put('/api/v1/campaign/:id/review/:id', ReviewController.updateReview);
router.delete('/api/v1/campaign/:id/review/:id', ReviewController.deleteReview);

router.post('/api/v1/campaign/:campaignId/candidate', CampaignCandidatePlayerController.getInstance().createCandidatePlayer);
router.get('/api/v1/campaign/:campaignId/candidate', CampaignCandidatePlayerController.getCandidatePlayers);
router.get('/api/v1/campaign/:campaignId/player/:playerId', CampaignCandidatePlayerController.getCandidatePlayer);
router.delete('/api/v1/campaign/:campaignId/player/:playerId', CampaignCandidatePlayerController.getInstance().deleteCandidatePlayer);

// router.post('/campaign/:campaignId/player', CampaignPlayerController.createPlayer);
// router.get('/campaign/:campaignId/players', CampaignPlayerController.getPlayers);
// router.get('/campaign/:campaignId/player/:playerId', CampaignPlayerController.getPlayer);
// router.delete('/campaign/:campaignId/player/:playerId', CampaignPlayerController.deletePlayer);

export default router;