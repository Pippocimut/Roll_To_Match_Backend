"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = validation;
const express_validator_1 = require("express-validator");
const validationFunction = (req, res, next) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    next();
};
function validation(...validationParams) {
    return [
        ...validationParams,
        validationFunction
    ];
}
//# sourceMappingURL=validationMiddleware.js.map