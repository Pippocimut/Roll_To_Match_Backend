import { Request, Response, Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import passport from '../auth/passport';
import { sign } from 'jsonwebtoken';

const router = Router();

router.get("/", (req, res) => { res.render("pages/auth") });

router.get("/google", passport.authenticate("google", { scope: ["profile", "email", "openid"] }));
router.get("/google/callback", passport.authenticate('google', { failureRedirect: "/login" }), async (req: Request, res: Response) => {
    const secretToken = process.env.TOKEN_SECRET
    if (!secretToken) {
        res.status(400).send({ message: 'Secret token not found' })
        return
    }

    if (!req.session) {
        res.status(400).send({ message: 'Session not found' })
        return
    }

    if (req.user === undefined) {
        res.status(400).send({ message: 'User not found' })
        return
    }

    req.session.accessToken = sign({ id: req.user._id }, secretToken, { expiresIn: '1d' })
    await req.session.save()
    res.redirect("/");
});

/* router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate('facebook', { failureRedirect: "/login" }), (req, res) => { res.redirect("/"); });
*/

router.post('/register', AuthController.getInstance().registerLocalUser);
router.post('/login', AuthController.getInstance().loginLocalUser);

router.get("/login", (req, res) => { res.render("pages/auth") });
router.get("/register", (req, res) => { res.render("pages/auth") });

module.exports = router