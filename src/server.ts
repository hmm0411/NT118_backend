//import app from "./app";
import express from "express";
import { env } from "./config/env";
import { connectRedis, redis } from "./config/redis";
import bookingRoutes from "./modules/booking/routes";

const app = express();
app.use(express.json());
app.use("/api/booking", bookingRoutes);
async function bootstrap() {
    await connectRedis(); // Chờ connect hoàn tất TRƯỚC khi thao tác

    try {
        // Kiểm tra thử Redis sau khi đã connect
        await redis.set("cine:test", "pong");
        const value = await redis.get("cine:test");
        console.log("Redis test OK:", value);
    } catch (err) {
        console.error("Redis test failed:", err);
    }

    app.listen(env.port, () => {
        console.log(`Server started at http://localhost:${env.port}`);
    });
}

bootstrap();
