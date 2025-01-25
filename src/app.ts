import './register-paths';
import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import "dotenv/config";
import { auth as onlyAuthorizedUsers } from './middlewares/authMiddleware';
import indexRoutes from './routes/index';
import { errorHandler } from './routes/error';

const authRouter = require('./routes/auth');
const errorRouter = require('./routes/error');
import session from 'express-session';
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


app.use('/auth', authRouter);

app.use(onlyAuthorizedUsers);
app.use('/', indexRoutes);
app.use(errorHandler);

mongoose.connect(process.env.BARE_MONGO_URL, {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
    dbName: process.env.DATABASE_NAME,
}).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});