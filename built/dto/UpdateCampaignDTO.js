"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCampaignZodSchema = void 0;
const zod_1 = require("zod");
const Room_1 = require("../database_models/Room");
exports.UpdateCampaignZodSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    owner: zod_1.z.string(),
    room: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()).min(1),
}).refine(data => {
    const getRoom = Room_1.RoomModel.findById(data.room);
    if (!getRoom) {
        throw new Error('Room does not exist');
    }
    return true;
});
//# sourceMappingURL=UpdateCampaignDTO.js.map