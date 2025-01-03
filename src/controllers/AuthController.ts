import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { LocalUserModel, PersistedLocalUser, UserModel } from '../database-models/User';
import { MongoDocument } from '../data-types';
import { LocalRegisterUserDTO, LocalRegisterUserZodSchema } from '../dto/LocalRegisterUserDTO';
import { UserDiscriminators } from '../database-models/User';

export class AuthController {
    public static registerLocalUser = registerLocalUser
    public static loginLocalUser = loginLocalUser
}

async function registerLocalUser(req: Request & { session: any }, res: Response): Promise<void> {
    try {
        const registerLocalUserDTO: LocalRegisterUserDTO = await LocalRegisterUserZodSchema.parseAsync(req.body);
        if (!registerLocalUserDTO) {
            res.status(400).send({ message: 'Invalid request body' });
            return
        }

        const salt = await bcryptjs.genSalt(5)
        const hashedPassword = await bcryptjs.hash(registerLocalUserDTO.password, salt)

        const persistedUser: PersistedLocalUser = {
            username: registerLocalUserDTO.username,
            email: registerLocalUserDTO.email,
            password: hashedPassword,
            slug: registerLocalUserDTO.slug,
            date: new Date()
        }

        const user = await LocalUserModel.create(persistedUser)

        req.session.accessToken = sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1d' })
        await req.session.save()

        const savedUser = await user.save()
        res.redirect('/')
    } catch (err) {
        console.error(err)
        res.status(400).send({ message: err })
    }
}

async function loginLocalUser(req: Request & { session: any }, res: Response): Promise<void> {
    try {
        const loginLocalUserDTO = await LocalRegisterUserZodSchema.parseAsync(req.body);
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

        req.session.accessToken = token
        await req.session.save()

        res.status(200).redirect('/')
    } catch (err) {
        res.status(400).send({ message: err })
    }
}