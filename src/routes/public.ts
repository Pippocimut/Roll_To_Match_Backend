import { Router } from 'express';
import { PageCampaignController } from '../controllers/WebControllers/PageCampaignController';
import { PageRoomController } from '../controllers/WebControllers/PageRoomController';

const router = Router();

router.get('/', PageCampaignController.getInstance().getCampaigns);
router.get('/campaign/:id', PageCampaignController.getInstance().getCampaign);
router.get('/campaigns', PageCampaignController.getInstance().getCampaigns);
router.get('/rooms', PageRoomController.getInstance().getRooms);
router.get('/room/:id/campaigns', PageCampaignController.getInstance().getRoomCampaigns);
router.get('/room/:id', PageRoomController.getInstance().getRoom);
export default router;