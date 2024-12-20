"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomModel = void 0;
var mongoose_1 = require("mongoose");
var Campaign_1 = require("./Campaign");
var RoomSchema = new mongoose_1.default.Schema({
    campaigns: [Campaign_1.CampaignSchema],
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    }
});
exports.RoomModel = mongoose_1.default.model('Room', RoomSchema);
//# sourceMappingURL=Room.js.map