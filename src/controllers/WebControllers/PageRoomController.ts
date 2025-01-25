import { Request, Response } from "express";
import { RoomModel } from "@roll-to-match/models";
import { fromPersistedToReturnedRoom } from "../../adapters/Room";

export class PageRoomController {

    private static instance: PageRoomController;

    public static getInstance(): PageRoomController {
        if (!PageRoomController.instance) {
            PageRoomController.instance = new PageRoomController();
        }
        return PageRoomController.instance;
    }

    public getRooms = async (req: Request, res: Response) => {
        const userId = req.user._id.toString();

        const rooms = await RoomModel.find({ owner: userId }).populate('campaigns').exec();
        const adaptedRooms = await Promise.all(rooms.map(async (room) => fromPersistedToReturnedRoom(room)));
        console.log(adaptedRooms)

        res.render('pages/rooms', { rooms: adaptedRooms });
    }

    public getRoom = async (req: Request, res: Response) => {
        const roomId = req.params.id;

        const room = await RoomModel.findById(roomId);
        const adaptedRoom = await fromPersistedToReturnedRoom(room);

        res.render('pages/room', { room: adaptedRoom });
    }
}