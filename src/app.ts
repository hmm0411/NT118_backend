import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error";
import authRoutes from "./modules/auth/routes";
import bookingRoutes from "./modules/booking/routes";
import userRoutes from "./modules/user/routes";
import testRoutes from "./modules/test/routes";
import movieRoutes from "./modules/movie/routes";
import regionRoutes from "./modules/region/routes";
import cinemaRouters from "./modules/cinema/routes";
import showtimeRouters from "./modules/showtime/routes";
import seatRouters from "./modules/seat/routes";
import paymentRouters from "./modules/payment/routes";
import session from "express-session";
import { setupSwagger } from "./config/swagger";

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

setupSwagger(app);

// Health checks
app.get("/", (_req, res) => res.json({ message: "Ciné API running" }));
app.get("/health", (_req, res) => res.sendStatus(200));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/test", testRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/cinemas", cinemaRouters);
app.use("/api/showtimes", showtimeRouters);
app.use("/api/seats", seatRouters);
app.use("/api/payment", paymentRouters);

// Error handling
app.use(errorHandler);

export default app;
