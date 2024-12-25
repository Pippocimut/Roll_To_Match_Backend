"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const authRouter = require('./routes/auth');
const errorRouter = require('./routes/error');
const auth_1 = require("firebase/auth");
const provider = new auth_1.GoogleAuthProvider();
const bodyParser = require("body-parser");
const session = require('express-session');
const passport_1 = __importDefault(require("passport"));
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User_1 = require("./database_models/User");
const app = (0, express_1.default)();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.use(express_1.default.static("public"));
app.use(express_1.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
passport_1.default.serializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.deserializeUser(function (id, done) {
    User_1.UserModel.findById(id, function (err, user) {
        done(err, user);
    });
});
app.get("/auth", passport_1.default.authenticate("google", { scope: ["profile"] }));
app.get("/callback/url/", passport_1.default.authenticate('google', { failureRedirect: "/login" }), function (req, res) {
    // Successful authentication, redirect to success.
    res.redirect("/success");
});
app.get("/", (req, res) => {
    res.render("pages/index");
});
/* app.use('/auth', authRouter);

app.use(onlyAuthorizedUsers);
app.use('/api',indexRoutes); */
app.use(errorRouter);
mongoose.connect(MONGO_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});
//# sourceMappingURL=app.js.map