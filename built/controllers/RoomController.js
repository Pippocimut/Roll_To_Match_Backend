"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.getRooms = getRooms;
exports.getRoom = getRoom;
exports.updateRoom = updateRoom;
const Room_1 = require("../database_models/Room");
async function createRoom(req, res) {
    const { campaigns, owner } = req.body;
    try {
        const room = await Room_1.RoomModel.create({ campaigns, owner });
        res.status(201).send(room);
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
    try {
        const room = await Room_1.RoomModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(room);
    }
    catch (err) {
        res.status(400).send(err);
    }
}
//# sourceMappingURL=RoomController.js.map