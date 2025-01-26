import { Router } from 'express';
import { PageCampaignController } from '../controllers/WebControllers/PageCampaignController';
import { PageRoomController } from '../controllers/WebControllers/PageRoomController';

const router = Router();

router.get('/', PageCampaignController.getInstance().getCampaigns);
router.get('/create-campaign/:id', (req, res) => { res.render('pages/create-campaign', { roomId: req.params.id }); });
router.get('/create-room', (req, res) => { res.render('pages/create-room'); });
router.get('/campaign/:id', PageCampaignController.getInstance().getCampaign);
router.get('/campaigns', PageCampaignController.getInstance().getCampaigns);
router.get('/rooms', PageRoomController.getInstance().getRooms);
router.get('/room/:id', PageRoomController.getInstance().getRoom);
router.get('/room/:id/campaigns',PageCampaignController.getInstance().getRoomCampaigns);

router.get('me/campaigns', PageCampaignController.getInstance().getMyCampaigns);
router.get('me/rooms', PageRoomController.getInstance().getRooms);
router.get('me', (req, res) => { res.render('pages/my'); });

export default router;