import admin from "firebase-admin";
import { env } from "./env";

if (!admin.apps.length) {
    const privateKey = env.firebasePrivateKey.replace(/\\n/g, "\n");

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: env.firebaseProjectId,
            clientEmail: env.firebaseClientEmail,
            privateKey,
        }),
        storageBucket: env.firebaseStorageBucket,
    });
}

export const firebaseAuth = admin.auth();
export const firebaseStorage = admin.storage();
export default admin;
