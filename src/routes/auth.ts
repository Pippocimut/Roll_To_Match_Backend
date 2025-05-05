import {NextFunction, Request, Response, Router} from 'express';
import {AuthController} from '../controllers/AuthController';
import passport from '../auth/passport';
import {sign} from 'jsonwebtoken';
import {fromPersistedToReturnedUser} from "../adapters/User";

const router = Router();

router.get("/me", (req, res) => {
    if (req.user) {
        res.send(fromPersistedToReturnedUser(req.user));
    } else {
        res.status(401).send({message: 'Unauthorized'});
    }
});

router.patch("/me", AuthController.getInstance().updateUser);

router.get("/google", (req, res, next) => {
    const {redirectUrl} = req.query; // Get the redirect URL from the query

    if (!redirectUrl) {
        return res.status(400).send({message: "Missing redirect_uri parameter"});
    }

    // Store the state (redirectUrl) securely in base64 encoding
    const state = Buffer.from(JSON.stringify({redirectUrl})).toString("base64");

    // Pass the state to `passport.authenticate`
    return passport.authenticate("google", {
        scope: ["profile", "email", "openid"],
        state, // Pass the state containing redirectUrl
    })(req, res, next); // Proper usage of the middleware
});

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res): Promise<void> => {
        const secretToken = process.env.TOKEN_SECRET;

        if (!secretToken) {
            res.status(400).send({ message: "Secret token not found" });
            return;
        }

        if (!req.user) {
            res.status(400).send({ message: "User not found" });
            return;
        }

        // Decode and parse the `state` parameter from the request query
        const state = req.query.state as string;
        let redirectUrl = "";
        if (state) {
            try {
                const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
                redirectUrl = decodedState.redirectUrl;
            } catch (error) {
                console.error("Failed to parse state parameter:", error);
                res.status(400).send({ message: "Invalid state parameter" });
                return;
            }
        }

        if (!redirectUrl) {
            res.status(400).send({ message: "Redirect URL missing or invalid" });
            return;
        }

        // ✅ Generate the access token
        const accessToken = sign({ id: req.user._id }, secretToken, { expiresIn: "1d" });

        // ✅ Set the access token as an HttpOnly, secure cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true, // Make sure you're using HTTPS in production
            sameSite: "lax", // Prevents CSRF in most cases
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // ✅ Redirect to frontend (no token in URL now)
        res.redirect(`${redirectUrl}/me`);
    }
);

/* router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate('facebook', { failureRedirect: "/login" }), (req, res) => { res.redirect("/"); });
*/

router.post('/register', AuthController.getInstance().registerLocalUser);
router.post('/login', AuthController.getInstance().loginLocalUser);

router.get("/login", (req, res) => {
    res.render("pages/auth")
});
router.get("/register", (req, res) => {
    res.render("pages/auth")
});
router.get("/logout", (req: Request, res) => {
    req.session.destroy(() => {
    });
    res.redirect("/auth/login");
});

export default router;