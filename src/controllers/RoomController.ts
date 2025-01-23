import { Request, Response } from "express";
import { PersistedRoom, RoomModel } from "../database-models/Room";
import { CreateRoomZodSchema } from "../dto/CreateRoomDTO";
import mongoose from "mongoose"
const { ObjectId, DocumentArray } = mongoose.Types;

export class RoomController {
    public static createRoom = createRoom;
    public static getRooms = getRooms;
    public static getRoom = getRoom;
    public static updateRoom = updateRoom;
    public static deleteRoom = deleteRoom;
}


export async function createRoom(req, res) {
    const createRoomDTO = CreateRoomZodSchema.parse(req.body);
    const room: PersistedRoom = {
        ...createRoomDTO,
        owner: new ObjectId(req.userId),
        campaigns: []
    }
    try {
        const createdRoom = await RoomModel.create(room);
        res.status(201).send(createdRoom);
    } catch (err) {
        res.status(400).send(err);
    }
}

export async function getRooms(req: Request, res: Response): Promise<void> {
    const rooms = await RoomModel.find();
    res.send(rooms);
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
    if (getRoom.owner.toString() !== req.userId.toString()) {
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
