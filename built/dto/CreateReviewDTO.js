"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReviewZodSchema = void 0;
const zod_1 = require("zod");
exports.CreateReviewZodSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
    stars: zod_1.z.number().min(1).max(6),
});
//# sourceMappingURL=CreateReviewDTO.js.map