import { PersistedRoom, RoomModel } from "../database_models/Room";
import { CreateRoomZodSchema } from "../dto/CreateRoomDTO";
import { UserCheckDTO, UserCheckZodSchema } from "../dto/UserCheckDTO";
import mongoose from "mongoose"
const { ObjectId, DocumentArray } = mongoose.Types;

export async function createRoom(req, res) {
    const createRoomDTO = CreateRoomZodSchema.parse(req.body);
    const userCheckDTO: UserCheckDTO = UserCheckZodSchema.parse(req.user)
    const room: PersistedRoom = {
        ...createRoomDTO,
        owner: new ObjectId(userCheckDTO.user),
        campaigns: new DocumentArray([])
    }
    try {
        const createdRoom = await RoomModel.create(room);
        res.status(201).send(createdRoom);
    } catch (err) {
        res.status(400).send(err);
    }
}

export async function getRooms(req, res) {
    try {
        const rooms = await RoomModel.find();
        res.send(rooms);
    } catch (err) {
        res.status(400).send(err);
    }
}

export async function getRoom(req, res) {
    try {
        const room = await RoomModel.findById(req.params.id);
        res.send(room);
    } catch (err) {
        res.status(400).send(err);
    }
}

export async function updateRoom(req, res) {
    res.send('updateRoom');
}

export async function deleteRoom(req, res) {
    const getRoom = await RoomModel.findById(req.params.id).populate('campaigns').exec();
    const forceDelete: boolean = req.params.forceDelete ? true : false
    if (!getRoom) {
        return res.status(400).send({ message: 'Room does not exist' })
    }
    if (getRoom.owner.toString() !== req.user.user) {
        return res.status(401).send({ message: 'Unauthorized' })
    }
    if (getRoom.campaigns.length > 0) {
        if (!forceDelete) {
            return res.status(400).send({ message: 'Room has campaigns, please delete campaigns or use force delete' })
        }
    }

    const deletedRoom = await RoomModel.deleteOne(getRoom._id)
    res.send("room deleted")
}
