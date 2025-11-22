import app from "./app";
import { env } from "./config/env";
import { startBookingCleanupJob } from "./cron/booking-cleanup";

startBookingCleanupJob();

async function bootstrap() {
    app.listen(env.port, () => {
        console.log(`Server started at http://localhost:${env.port}`);
    });
}

bootstrap();
