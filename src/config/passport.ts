import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { firebaseDB } from "./firebase";
import admin from "firebase-admin";

// Serialize / Deserialize
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id: number, done) => {
    try {
        const doc = await firebaseDB.collection('users').doc(String(id)).get();
        if (!doc.exists) return done(null, null);
        done(null, { id: doc.id, ...doc.data() });
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

                const q = await firebaseDB.collection('users').where('email', '==', email).get();
                if (!q.empty) return done(null, { id: q.docs[0].id, ...q.docs[0].data() });

                const docRef = await firebaseDB.collection('users').add({
                    email,
                    name,
                    provider: 'google',
                    provider_id: profile.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                const newUser = { id: docRef.id, email, name };
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

                const q = await firebaseDB.collection('users').where('email', '==', email).get();
                if (!q.empty) return done(null, { id: q.docs[0].id, ...q.docs[0].data() });

                const docRef = await firebaseDB.collection('users').add({
                    email,
                    name,
                    provider: 'facebook',
                    provider_id: profile.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                const newUser = { id: docRef.id, email, name };
                return done(null, newUser);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

export default passport;