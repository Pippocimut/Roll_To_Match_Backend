const mongoose = require('mongoose');
import express from 'express';
import "dotenv/config";
const authRouter = require('./routes/auth');
const errorRouter = require('./routes/error');
import {auth as onlyAuthorizedUsers} from './middlewares/authMiddleware';
import indexRoutes from './routes/index';
const app = express();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/auth', authRouter);

app.use(onlyAuthorizedUsers);
app.use('/api',indexRoutes);

app.use(errorRouter);

mongoose.connect(MONGO_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});

