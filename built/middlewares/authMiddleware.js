"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = require("jsonwebtoken");
require("dotenv/config");
function auth(req, res, next) {
    if (!req.headers['authorization']) {
        return res.status(401).send({ message: 'Access denied' });
    }
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Access denied' });
    }
    try {
        const verified = (0, jsonwebtoken_1.verify)(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(401).send({ message: 'Invalid token or expired' });
    }
}
//# sourceMappingURL=authMiddleware.js.map