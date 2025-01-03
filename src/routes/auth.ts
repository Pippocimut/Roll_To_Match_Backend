import { Request, Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import passport from '../auth/passport';
import { sign } from 'jsonwebtoken';

const router = Router();

router.get("/", (req, res) => { res.render("pages/auth") });

router.get("/google", passport.authenticate("google", { scope: ["profile", "email", "openid"] }));
router.get("/google/callback", passport.authenticate('google', { failureRedirect: "/login" }), async (req: Request & { session: any, user: any }, res) => {
    req.session.accessToken = sign({ id: req.user._id }, process.env.TOKEN_SECRET, { expiresIn: '1d' })
    await req.session.save()
    res.redirect("/");
});

/* router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate('facebook', { failureRedirect: "/login" }), (req, res) => { res.redirect("/"); });
*/

router.post('/register', AuthController.registerLocalUser);
router.post('/login', AuthController.loginLocalUser);

router.get("/login", (req, res) => { res.render("pages/auth") });
router.get("/register", (req, res) => { res.render("pages/auth") });

module.exports = router