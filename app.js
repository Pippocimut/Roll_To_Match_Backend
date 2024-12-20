const mongoose = require('mongoose');
const express = require('express');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const errorRouter = require('./routes/error');
const onlyAuthorizedUsers = require('./middlewares/authMiddleware');
const app = express();
require('dotenv').config();

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
app.use('/api', indexRouter);

app.use(errorRouter);

mongoose.connect(MONGO_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});

