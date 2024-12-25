import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const validationFunction = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    next();
}

export function validation(...validationParams) {
    return [
        ...validationParams,
        validationFunction
    ]
}