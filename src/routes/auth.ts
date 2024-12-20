import { Router } from 'express';
import { body } from 'express-validator';
import { validation } from '../middlewares/validationMiddleware';
import bcryptjs from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { UserModel } from '../database_models/User';

const registerBody = [
    body('username').isLength({ min: 3, max: 256 }),
    body('email').isEmail().isLength({ min: 6, max: 256 }),
    body('password').isLength({ min: 6, max: 1024 })
];

const loginBody = [
    body('email').isEmail().isLength({ min: 6, max: 256 }),
    body('password').isLength({ min: 6, max: 1024 })
];

const router = Router();

router.post('/register', validation(registerBody), async (req, res) => {

    const userExists = await UserModel.findOne({ email: req.body.email, username: req.body.username })
    if (userExists) {
        return res.status(400).send({ message: 'UserModel already exists' })
    }

    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password, salt)

    const user = new UserModel({
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

    const user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).send({ message: 'UserModel does not exist' })
    }

    const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
    if (!passwordValidation) {
        return res.status(400).send({ message: 'Password is wrong' })
    }

    const token = sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1d' })
    res.header('auth-token', token).send({ 'auth-token': token })

})

module.exports = router