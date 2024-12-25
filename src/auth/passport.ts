import "dotenv/config";
import passport from "passport"
const GoogleStrategy = require('passport-google-oauth20').Strategy;
import { GoogleUserModel, UserModel } from '../database_models/User';

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    UserModel.findById(id).then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err, null);
    });
});

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (id, done) {
    UserModel.findById(id).then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err, null);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:80/callback/url",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            const user = await GoogleUserModel.findOne({ googleId: profile.id })

            if (user) {
                return cb(null, user);
            }
            else {
                const createdUser = new GoogleUserModel({
                    username: profile.displayName,
                    slug: profile.displayName.trim().toLowerCase().replace(/ /g, '-'),
                    email: profile.emails[0].value,
                    date: Date.now(),
                    googleId: profile.id
                });
                await createdUser.save()
                return cb(null, createdUser);
            }
        } catch (err) {
            return cb(err, null);
        }
    }
));

export default passport;