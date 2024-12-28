import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import passport from '../auth/passport';

const router = Router();

router.get("/login", (req, res) => { res.render("pages/login") });
router.get("/register", (req, res) => { res.render("pages/register") });

router.get("/google", passport.authenticate("google", { scope: ["profile", "email", "openid"] }));
router.get("/google/callback", passport.authenticate('google', { failureRedirect: "/login" }), (req, res) => { res.redirect("/"); });

router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate('facebook', { failureRedirect: "/login" }), (req, res) => { res.redirect("/"); });

router.post('/register', AuthController.registerLocalUser);
router.post('/login', AuthController.loginLocalUser);

module.exports = router