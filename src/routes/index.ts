import { Router } from 'express';
import { PageCampaignController } from '../controllers/WebControllers/PageCampaignController';
import { PageRoomController } from '../controllers/WebControllers/PageRoomController';

const router = Router();

router.get('/create-campaign/:id', (req, res) => { res.render('pages/create-campaign', { roomId: req.params.id }); });
router.get('/create-room', (req, res) => { res.render('pages/create-room'); });
router.get('/me/campaigns', PageCampaignController.getInstance().getMyCampaigns);
router.get('/me/rooms', PageRoomController.getInstance().getMyRooms);
router.get('/me', (req, res) => { res.render('pages/me/profile'); });

export default router;