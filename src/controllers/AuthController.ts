import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { LocalUserModel, PersistedLocalUser, UserModel } from '../database_models/User';
import { MongoDocument } from '../types';
import { LocalRegisterUserZodSchema } from '../dto/LocalRegisterUserDTO';

export class AuthController {
    public static registerLocalUser = registerLocalUser
    public static loginLocalUser = loginLocalUser
}

async function registerLocalUser(req: Request, res: Response): Promise<void> {
    const registerLocalUserDTO = LocalRegisterUserZodSchema.parse(req.body);
    if (!registerLocalUserDTO) {
        res.status(400).send({ message: 'Invalid request body' });
        return
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
}

async function loginLocalUser(req: Request, res: Response): Promise<void> {
    const loginLocalUserDTO = LocalRegisterUserZodSchema.parse(req.body);
    if (!loginLocalUserDTO) {
        res.status(400).send({ message: 'Invalid request body' });
        return
    }

    const user: MongoDocument<PersistedLocalUser> = await UserModel.findOne({
        $or: [
            { email: req.body.email },
            { username: req.body.username },
            { slug: req.body.slug }
        ]
    })

    if (!user) {
        res.status(400).send({ message: 'LocalUserModel does not exist' })
        return
    }

    const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
    if (!passwordValidation) {
        res.status(400).send({ message: 'Password is wrong' })
        return
    }

    const token = sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1d' })

    res.header('auth-token', token).send({ 'auth-token': token })
}