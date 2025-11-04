import dotenv from "dotenv";
import type { StringValue } from "ms";
dotenv.config();

export const env: {
    port: number;
    jwtSecret: string;
    jwtExpires: StringValue | number;
    firebaseProjectId: string;
    firebaseClientEmail: string;
    firebasePrivateKey: string;
    firebaseCredentialPath?: string;
    firebaseStorageBucket: string;
    googleClientId: string;
} = {
    port: Number(process.env.PORT || 5000),
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpires: (process.env.JWT_EXPIRES || "30m") as StringValue,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || "",
    firebaseCredentialPath: process.env.FIREBASE_CREDENTIAL_PATH || undefined,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};
