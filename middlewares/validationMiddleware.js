const { validationResult } = require('express-validator');

const validationFunction = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    next();
}

exports.validation = (...validationParams) => {
    return [
        ...validationParams,
        validationFunction
    ]
}