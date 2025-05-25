import {Router} from 'express';
import {CampaignController} from '../controllers/CampaignController';
import {CampaignPlayerController} from '../controllers/CampaignPlayerController';
import {CampaignCandidatePlayerController} from 'controllers/CampaignCandidatePlayerController';
import multer from "multer";
import {auth as requiresAuth} from "../middlewares/authMiddleware"
import {fromPersistedToReturnedUser} from "../adapters/User";
import {AuthController} from "../controllers/AuthController";

const router = Router();

var upload = multer({dest: './uploads'});

router.get("/me", requiresAuth, (req, res) => {
    if (req.user) {
        res.send(fromPersistedToReturnedUser(req.user));
    } else {
        res.status(401).send({message: 'Unauthorized'});
    }
});

router.patch("/me", requiresAuth, AuthController.getInstance().updateUser);
router.delete("/me", requiresAuth, AuthController.getInstance().deleteUser);

router.get('/campaigns', CampaignController.getInstance().getCampaigns);
router.post('/campaign', requiresAuth, CampaignController.getInstance().createCampaign);

router.get('/campaign/:id', CampaignController.getInstance().getCampaign);
router.patch('/campaign/:id', requiresAuth, CampaignController.getInstance().updateCampaign);
router.delete('/campaign/:id', requiresAuth, CampaignController.getInstance().deleteCampaign);

router.post('/campaign/:campaignId/join', requiresAuth, CampaignCandidatePlayerController.getInstance().createCandidatePlayer);
router.delete('/campaign/:campaignId/player/:playerId', requiresAuth, CampaignCandidatePlayerController.getInstance().deleteCandidatePlayer);

router.post('/campaign/:campaignId/player/:playerId', requiresAuth, CampaignPlayerController.createPlayer);
router.delete('/campaign/:campaignId/active-player/:playerId', requiresAuth, CampaignPlayerController.kickPlayer);

export default router;