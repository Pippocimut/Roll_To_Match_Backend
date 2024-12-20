"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCheckZodSchema = void 0;
const zod_1 = require("zod");
const User_1 = require("../database_models/User");
exports.UserCheckZodSchema = zod_1.z.object({
    user: zod_1.z.string(),
}).refine(data => {
    const getUser = User_1.UserModel.findById(data.user);
    if (!getUser) {
        throw new Error('User does not exist');
    }
});
//# sourceMappingURL=UserCheckDTO.js.map