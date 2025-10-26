import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error";
import authRoutes from "./modules/auth/routes";
//import bookingRoutes from "./modules/booking/routes";
import userRoutes from "./modules/user/routes";
import session from "express-session";

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

// Health checks
app.get("/", (_req, res) => res.json({ message: "Ciné API running" }));
app.get("/health", (_req, res) => res.sendStatus(200));

// API routes
app.use("/api/auth", authRoutes);
//app.use("/api/booking", bookingRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use(errorHandler);

export default app;
