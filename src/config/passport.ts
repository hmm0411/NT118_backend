import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { db } from "./db";

// Serialize / Deserialize
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id: number, done) => {
    try {
        const [rows]: any = await db.query("SELECT * FROM users WHERE id = ?", [id]);
        done(null, rows[0]);
    } catch (err) {
        done(err, null);
    }
});

// GOOGLE STRATEGY
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: "/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                const name = profile.displayName;

                const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
                if (rows.length > 0) return done(null, rows[0]);

                const [result]: any = await db.query(
                    "INSERT INTO users (email, name, provider, provider_id) VALUES (?, ?, ?, ?)",
                    [email, name, "google", profile.id]
                );
                const newUser = { id: result.insertId, email, name };
                return done(null, newUser);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

// FACEBOOK STRATEGY
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            callbackURL: "/api/auth/facebook/callback",
            profileFields: ["id", "displayName", "emails"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                const name = profile.displayName;

                const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
                if (rows.length > 0) return done(null, rows[0]);

                const [result]: any = await db.query(
                    "INSERT INTO users (email, name, provider, provider_id) VALUES (?, ?, ?, ?)",
                    [email, name, "facebook", profile.id]
                );
                const newUser = { id: result.insertId, email, name };
                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

export default passport;