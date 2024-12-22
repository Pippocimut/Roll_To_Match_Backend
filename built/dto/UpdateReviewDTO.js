"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReviewZodSchema = void 0;
const zod_1 = require("zod");
exports.UpdateReviewZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    message: zod_1.z.string().min(1).optional(),
    stars: zod_1.z.number().min(1).max(6).optional(),
});
//# sourceMappingURL=UpdateReviewDTO.js.map