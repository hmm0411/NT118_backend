import { createClient } from "redis";
import { env } from "./env";

export const redis = createClient({
    url: env.redisUrl,
});

redis.on("error", (err) => console.error("Redis error:", err));

export async function connectRedis() {
    if (!redis.isOpen) {
        try {
            await redis.connect();
            console.log("Redis connected!");
        } catch (err) {
            console.error("Failed to connect Redis:", err);
        }
    } else {
        console.log("Redis already connected");
    }
}
