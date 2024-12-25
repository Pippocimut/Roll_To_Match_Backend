"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.UserSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const GoogleStrategy = require('passport-google-oauth20').Strategy;
exports.UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    googleId: String,
});
exports.UserModel = mongoose_1.default.model('User', exports.UserSchema);
passport_1.default.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/callback/url",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, function (accessToken, refreshToken, profile, cb) {
    console.log(profile);
    exports.UserModel.find({ googleId: profile.googleId }, function (err, user) {
        return cb(err, user);
    }).then((user) => {
        if (!user) {
            return exports.UserModel.create({
                username: profile.displayName,
                slug: profile.displayName,
                email: profile.emails[0].value,
                password: '',
                googleId: profile.googleId
            }).then((user) => {
                return cb(null, user);
            }).catch((err) => {
                return cb(err, null);
            });
        }
        return cb(null, user);
    }).catch((err) => {
        return cb(err, null);
    });
}));
//# sourceMappingURL=User.js.map