"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = require("../database_models/User");
const registerBody = [
    (0, express_validator_1.body)('username').isLength({ min: 3, max: 256 }),
    (0, express_validator_1.body)('email').isEmail().isLength({ min: 6, max: 256 }),
    (0, express_validator_1.body)('password').isLength({ min: 6, max: 1024 })
];
const loginBody = [
    (0, express_validator_1.body)('email').isEmail().isLength({ min: 6, max: 256 }),
    (0, express_validator_1.body)('password').isLength({ min: 6, max: 1024 })
];
const router = (0, express_1.Router)();
router.post('/register', (0, validationMiddleware_1.validation)(registerBody), async (req, res) => {
    const userExists = await User_1.UserModel.findOne({ email: req.body.email, username: req.body.username });
    if (userExists) {
        return res.status(400).send({ message: 'UserModel already exists' });
    }
    const salt = await bcryptjs_1.default.genSalt(5);
    const hashedPassword = await bcryptjs_1.default.hash(req.body.password, salt);
    const user = new User_1.UserModel({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        res.send(savedUser);
    }
    catch (err) {
        res.status(400).send({ message: err });
    }
});
router.post('/login', (0, validationMiddleware_1.validation)(loginBody), async (req, res) => {
    const user = await User_1.UserModel.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send({ message: 'UserModel does not exist' });
    }
    const passwordValidation = await bcryptjs_1.default.compare(req.body.password, user.password);
    if (!passwordValidation) {
        return res.status(400).send({ message: 'Password is wrong' });
    }
    const token = (0, jsonwebtoken_1.sign)({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1d' });
    res.header('auth-token', token).send({ 'auth-token': token });
});
module.exports = router;
//# sourceMappingURL=auth.js.map