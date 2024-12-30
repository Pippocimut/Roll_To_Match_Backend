import mongoose from 'mongoose';
import express from 'express';
import "dotenv/config";
import { auth as onlyAuthorizedUsers } from './middlewares/authMiddleware';
import indexRoutes from './routes/index';
import path from 'path';

const authRouter = require('./routes/auth');
const errorRouter = require('./routes/error');

const session = require('express-session');
const app = express();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.post('/send-location', (req, res) => {
    console.log(req.body);
    console.log(req.body.lat);
    res.send('Location received');
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

