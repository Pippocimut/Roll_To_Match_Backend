import { Router } from 'express';
import { body } from 'express-validator';
import { validation } from '../middlewares/validationMiddleware';
import bcryptjs from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { LocalUserModel, PersistedLocalUser } from '../database_models/User';
import { MongoDocument } from '../types';
import passport from '../auth/passport';

const router = Router();

router.get("/auth",
    passport.authenticate("google", { scope: ["profile", "email", "openid"] })
);

router.get("/success", (req, res) => {
    res.send("Success");
});

router.get("/callback/url/",
    passport.authenticate('google', { failureRedirect: "/login" }),
    function (req, res) {
        res.redirect("/success");
    }
);

router.get("/", (req, res) => {
    res.render("pages/index");
});

/*

const registerBody = [
    body('username').isLength({ min: 3, max: 256 }),
    body('email').isEmail().isLength({ min: 6, max: 256 }),
    body('password').isLength({ min: 6, max: 1024 })
];

const loginBody = [
    body('email').isEmail().isLength({ min: 6, max: 256 }),
    body('password').isLength({ min: 6, max: 1024 })
];

router.post('/register', validation(registerBody), async (req, res) => {

    const userExists = await LocalUserModel.findOne({ email: req.body.email, username: req.body.username })
    if (userExists) {
        return res.status(400).send({ message: 'LocalUserModel already exists' })
    }

    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password, salt)

    const user = new LocalUserModel({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    })

    try {
        const savedUser = await user.save()
        res.send(savedUser)
    } catch (err) {
        res.status(400).send({ message: err })
    }

})

router.post('/login', validation(loginBody), async (req, res) => {

    const user: MongoDocument<PersistedLocalUser> = await LocalUserModel.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).send({ message: 'LocalUserModel does not exist' })
    }

    const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
    if (!passwordValidation) {
        return res.status(400).send({ message: 'Password is wrong' })
    }

    const token = sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1d' })
    res.header('auth-token', token).send({ 'auth-token': token })

})
    */

module.exports = router