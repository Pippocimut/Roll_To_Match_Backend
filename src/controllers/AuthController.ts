import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {LocalUserModel, PersistedLocalUser, UserModel} from '../database-models/User';
import { MongoDocument } from '../data-types';
import { LocalRegisterUserDTO, LocalRegisterUserZodSchema } from '../dto/LocalRegisterUserDTO';
import {UpdateUserZodSchema} from "../dto/UpdateUserDTO";
import {CampaignModel, RoomModel} from "@roll-to-match/models";

export class AuthController {

    private static instance: AuthController;

    public static getInstance(): AuthController {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }

    public updateUser = async (req: Request, res: Response): Promise<void> =>  {
        const updateUserDTO = UpdateUserZodSchema.safeParse(req.body);
        if (!updateUserDTO.success) {
            res.status(400).send({ message: updateUserDTO.error.message });
            return Promise.resolve();
        }

        const user = req.user
        if (!user) {
            res.status(400).send({ message: 'User not found' })
            return Promise.resolve();
        }

        const updateUserResult = await UserModel.updateOne({ _id: user._id }, updateUserDTO.data)
        res.status(200).send(updateUserResult)
    }

    public deleteUser = async (req: Request, res: Response): Promise<void> =>  {
        const user = req.user
        if (!user) {
            res.status(400).send({ message: 'User not found' })
            return Promise.resolve();
        }

        const deleteCampaigns = await UserModel.deleteMany({ owner: user._id })
        const removeFromJoinedCampaings = await CampaignModel.updateMany({ playerQueue: user._id }, { $pull: { playerQueue: user._id } })
        const removeFromJoinedCampaings2 = await CampaignModel.updateMany({ activePlayers: user._id }, { $pull: { activePlayers: user._id } })
        const removeRooms = await RoomModel.deleteMany({owner: user._id})
        const removeCampaigns = await CampaignModel.deleteMany({owner: user._id})

        const deleteUserResult = await UserModel.deleteOne({ _id: user._id })
        res.status(200).send(deleteUserResult)
    }

    public async registerLocalUser(req: Request, res: Response): Promise<void> {
        try {
            const registerLocalUserDTO: LocalRegisterUserDTO = await LocalRegisterUserZodSchema.parseAsync(req.body);
            if (!registerLocalUserDTO) {
                res.status(400).send({ message: 'Invalid request body' });
                return Promise.resolve();
            }

            const salt = await bcryptjs.genSalt(5)
            const hashedPassword = await bcryptjs.hash(registerLocalUserDTO.password, salt)

            let hasDuplicateSlugOrUsername = await LocalUserModel.findOne({ $or: [{ slug: registerLocalUserDTO.slug }, { username: registerLocalUserDTO.username }] })
            while (hasDuplicateSlugOrUsername) {
                registerLocalUserDTO.slug += `-${Math.floor(Math.random() * 1000)}`
                hasDuplicateSlugOrUsername = await LocalUserModel.findOne({ $or: [{ slug: registerLocalUserDTO.slug }, { username: registerLocalUserDTO.username }] })
            }

            const persistedUser: PersistedLocalUser = {
                username: registerLocalUserDTO.username,
                email: registerLocalUserDTO.email,
                password: hashedPassword,
                slug: registerLocalUserDTO.slug,
                date: new Date()
            }

            const user = await LocalUserModel.create(persistedUser)

            const secretToken = process.env.SECRET_TOKEN
            if (!secretToken) {
                res.status(400).send({ message: 'Secret token not found' })
                return Promise.resolve();
            }

            if (!req.session) {
                res.status(400).send({ message: 'Session not found' })
                return Promise.resolve();
            }

            req.session.accessToken = sign({ id: user._id }, secretToken, { expiresIn: '1d' })
            await req.session.save()

            const savedUser = await user.save()
            res.redirect('/')
        } catch (err) {
            console.error(err)
            res.status(400).send({ message: err })
        }
    }

    public async loginLocalUser(req: Request, res: Response): Promise<void> {
        try {
            const loginLocalUserDTO = await LocalRegisterUserZodSchema.parseAsync(req.body);
            if (!loginLocalUserDTO) {
                res.status(400).send({ message: 'Invalid request body' });
                return Promise.resolve();
            }

            const user: MongoDocument<PersistedLocalUser> | null = await LocalUserModel.findOne({
                $or: [
                    { email: req.body.email },
                    { username: req.body.username },
                    { slug: req.body.slug }
                ]
            })

            if (!user) {
                res.status(400).send({ message: 'LocalUserModel does not exist' })
                return Promise.resolve();
            }

            const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
            if (!passwordValidation) {
                res.status(400).send({ message: 'Password is wrong' })
                return Promise.resolve();
            }

            const secretToken = process.env.SECRET_TOKEN
            if (!secretToken) {
                res.status(400).send({ message: 'Secret token not found' })
                return Promise.resolve();
            }

            const token = sign({ id: user._id }, secretToken, { expiresIn: '1d' })

            req.session.accessToken = token
            await req.session.save()

            res.status(200).redirect('/')
        } catch (err) {
            res.status(400).send({ message: err })
        }
    }
}