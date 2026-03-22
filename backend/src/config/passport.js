import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import crypto from "crypto";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/users/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Check if email already registered normally
        user = await User.findOne({ username: profile.emails[0].value });
        if (user) {
          // Link Google to existing account
          user.googleId = profile.id;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            name: profile.displayName,
            username: profile.emails[0].value,
            password: crypto.randomBytes(32).toString("hex"), // dummy password
            googleId: profile.id
          });
        }
      }

      const token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();

      return done(null, { token });
    } catch (err) {
      return done(err, null);
    }
  }
));

export default passport;