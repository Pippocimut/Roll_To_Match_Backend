import "dotenv/config";
import passport from "passport"
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
import { FacebookUserModel, GoogleUserModel, UserModel } from '../database-models/User';

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

passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:80/auth/facebook/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            const user = await FacebookUserModel.findOne({ googleId: profile.id })

            if (user) {
                return cb(null, user);
            }
            else {
                const createdUser = new FacebookUserModel({
                    username: profile.displayName,
                    slug: profile.displayName.trim().toLowerCase().replace(/ /g, '-'),
                    email: profile.emails[0].value,
                    date: Date.now(),
                    facebookId: profile.id
                });
                await createdUser.save()
                return cb(null, createdUser);
            }
        } catch (err) {
            return cb(err, null);
        }
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:80/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            let user = await GoogleUserModel.findOne({ googleId: profile.id })

            if (!user) {
                let hasDuplicateSlugOrUsername = await UserModel.findOne({ $or: [{ slug: profile.displayName.trim().toLowerCase().replace(/ /g, '-') }, { username: profile.displayName }] })
                while (hasDuplicateSlugOrUsername) {
                    profile.displayName += `-${Math.floor(Math.random() * 1000)}`
                    hasDuplicateSlugOrUsername = await UserModel.findOne({ $or: [{ slug: profile.displayName.trim().toLowerCase().replace(/ /g, '-') }, { username: profile.displayName }] })
                }
                console.log(profile.displayName)
                user = new GoogleUserModel({
                    username: profile.displayName,
                    slug: profile.displayName.trim().toLowerCase().replace(/ /g, '-'),
                    email: profile.emails[0].value,
                    date: Date.now(),
                    googleId: profile.id
                });
                await user.save()
            }
            return cb(null, user);

        } catch (err) {
            return cb(err, null);
        }
    }
));

export default passport;