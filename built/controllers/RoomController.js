"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
exports.createRoom = createRoom;
exports.getRooms = getRooms;
exports.getRoom = getRoom;
exports.updateRoom = updateRoom;
exports.deleteRoom = deleteRoom;
const Room_1 = require("../database_models/Room");
const CreateRoomDTO_1 = require("../dto/CreateRoomDTO");
const UserCheckDTO_1 = require("../dto/UserCheckDTO");
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId, DocumentArray } = mongoose_1.default.Types;
class RoomController {
    static createRoom = createRoom;
    static getRooms = getRooms;
    static getRoom = getRoom;
    static updateRoom = updateRoom;
    static deleteRoom = deleteRoom;
}
exports.RoomController = RoomController;
async function createRoom(req, res) {
    const createRoomDTO = CreateRoomDTO_1.CreateRoomZodSchema.parse(req.body);
    const userCheckDTO = UserCheckDTO_1.UserCheckZodSchema.parse(req.user);
    const room = {
        ...createRoomDTO,
        owner: new ObjectId(userCheckDTO.user),
        campaigns: new DocumentArray([])
    };
    try {
        const createdRoom = await Room_1.RoomModel.create(room);
        res.status(201).send(createdRoom);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
async function getRooms(req, res) {
    try {
        const rooms = await Room_1.RoomModel.find();
        res.send(rooms);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
async function getRoom(req, res) {
    try {
        const room = await Room_1.RoomModel.findById(req.params.id);
        res.send(room);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
async function updateRoom(req, res) {
    res.send('updateRoom');
}
async function deleteRoom(req, res) {
    const getRoom = await Room_1.RoomModel.findById(req.params.id).populate('campaigns').exec();
    const forceDelete = req.params.forceDelete ? true : false;
    if (!getRoom) {
        return res.status(400).send({ message: 'Room does not exist' });
    }
    if (getRoom.owner.toString() !== req.user.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    if (getRoom.campaigns.length > 0) {
        if (!forceDelete) {
            return res.status(400).send({ message: 'Room has campaigns, please delete campaigns or use force delete' });
        }
    }
    const deletedRoom = await Room_1.RoomModel.deleteOne(getRoom._id);
    res.send("room deleted");
}
//# sourceMappingURL=RoomController.js.map