import './register-paths';
import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import "dotenv/config";
import { auth as onlyAuthorizedUsers } from './middlewares/authMiddleware';
import indexRoutes from './routes/index';
import { errorHandler } from './routes/error';
import session from 'express-session'
import MongoStore from 'connect-mongo'

const authRouter = require('./routes/auth');
import apiRouter from './routes/api';
import { assertEnvVariables } from 'util/assertEnvVariables';
import { env } from 'process';
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const envVariable = assertEnvVariables([
    'BARE_MONGO_URL',
    'MONGO_USER',
    'MONGO_PASS',
    'DATABASE_NAME',
])

console.log(JSON.stringify(envVariable))

mongoose.connect(envVariable["BARE_MONGO_URL"], {
    user: envVariable["MONGO_USER"],
    pass: envVariable["MONGO_PASS"],
    dbName: envVariable["DATABASE_NAME"],
}).then(() => {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 settimana
        }
    }));

    console.log('Connected to MongoDB');
    app.use('/auth', authRouter);
    app.use(onlyAuthorizedUsers);
    app.use('/', indexRoutes);
    app.use('/api/v1', apiRouter)
    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});