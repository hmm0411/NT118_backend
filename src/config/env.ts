import dotenv from "dotenv";
import type { StringValue } from "ms";
dotenv.config();

export const env: {
    port: number;
    db: {
        host: string;
        user: string;
        password: string;
        database: string;
    };
    redisUrl: string;
    jwtSecret: string;
    jwtExpires: StringValue | number;

    firebaseProjectId: string;
    firebaseClientEmail: string;
    firebasePrivateKey: string;
    firebaseStorageBucket: string;
} = {
    port: Number(process.env.PORT || 5000),
    db: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        database: process.env.DB_NAME!,
    },
    redisUrl: process.env.REDIS_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpires: (process.env.JWT_EXPIRES || "30m") as StringValue,

    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || "",
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
};
