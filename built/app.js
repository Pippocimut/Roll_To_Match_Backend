"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const express_1 = __importDefault(require("express"));
const authRouter = require('./routes/auth');
const errorRouter = require('./routes/error');
const authMiddleware_1 = require("./middlewares/authMiddleware");
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/auth', authRouter);
app.use(authMiddleware_1.auth);
app.use('/api', index_1.default);
app.use(errorRouter);
mongoose.connect(MONGO_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});
//# sourceMappingURL=app.js.map