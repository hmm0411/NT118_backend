import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { env } from "./env";

if (!admin.apps.length) {
    let credential: admin.ServiceAccount | undefined;

    // Prefer a credentials JSON file if provided
    if (env.firebaseCredentialPath) {
        const credPath = path.isAbsolute(env.firebaseCredentialPath)
            ? env.firebaseCredentialPath
            : path.resolve(process.cwd(), env.firebaseCredentialPath);

        if (fs.existsSync(credPath)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const serviceAccount = require(credPath);
            credential = {
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key,
            };
        }
    }

    // Fall back to individual env vars
    if (!credential) {
        let privateKey = env.firebasePrivateKey || "";
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, "\n");

        credential = {
            projectId: env.firebaseProjectId,
            clientEmail: env.firebaseClientEmail,
            privateKey,
        };
    }

    admin.initializeApp({
        credential: admin.credential.cert(credential),
        storageBucket: env.firebaseStorageBucket,
        databaseURL: env.firebaseProjectId ? `https://${env.firebaseProjectId}.firebaseio.com` : undefined,
    });
}

export const firebaseAuth = admin.auth();
export const firebaseDB = admin.firestore();
export const firebaseStorage = admin.storage();
export const firebaseBucket = admin.storage().bucket();
export default admin;
