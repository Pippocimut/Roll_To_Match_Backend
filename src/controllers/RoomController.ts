import { Request, Response } from "express";
import { PersistedRoom, RoomModel } from "../database-models/Room";
import { CreateRoomZodSchema } from "../dto/CreateRoomDTO";
import { fromPersistedToReturnedRoom } from "../adapters/Room";
import mongoose from "mongoose"
import { MongoDocument } from "data-types/temp";
import { PersistedCampaign } from "database-models/Campaign";
const { ObjectId, DocumentArray } = mongoose.Types;

export class RoomController {
    public static createRoom = async (req: Request, res: Response) => {
        try {
            const createRoomDTO = CreateRoomZodSchema.parse(req.body);

            if (!req.user) {
                res.status(401).send('Unauthorized');
                return;
            }
            const room: PersistedRoom = {
                title: createRoomDTO.title,
                owner: new ObjectId(req.user._id.toString()),
                campaigns: []
            }

            const createdRoom = await RoomModel.create(room).then(async (room) => await room.populate<{ campaigns: MongoDocument<PersistedCampaign>[] }>('campaigns'));
            const adaptedRoom = await fromPersistedToReturnedRoom(createdRoom)
            res.status(200).send(adaptedRoom)
        } catch (err) {
            res.status(400).send(err);
        }

    }

    public static getRooms = async (req: Request, res: Response) => {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }
        const userId = req.user._id.toString();

        const rooms = await RoomModel.find({ owner: userId }).populate<{ campaigns: MongoDocument<PersistedCampaign>[] }>('campaigns').exec();
        const adaptedRooms = await Promise.all(rooms.map(async (room) => fromPersistedToReturnedRoom(room)));
        console.log(adaptedRooms)

        res.status(200).send(adaptedRooms)
    }

    public static getRoom = async (req: Request, res: Response) => {
        const roomId = req.params.id;

        const room = await RoomModel.findById(roomId).populate<{ campaigns: MongoDocument<PersistedCampaign>[] }>('campaigns').exec()

        if (!room) {
            res.status(404).send('Room not found');
            return;
        }
        const adaptedRoom = await fromPersistedToReturnedRoom(room);

        res.status(200).send(adaptedRoom)
    }

    public static updateRoom = updateRoom;
    public static deleteRoom = deleteRoom;
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
    if (!getRoom.owner) {
        return res.status(400).send({ message: 'Room does not have an owner' })
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
