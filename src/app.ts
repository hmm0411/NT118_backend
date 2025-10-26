import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error";
import authRoutes from "./modules/auth/routes";
//import bookingRoutes from "./modules/booking/routes";
import userRoutes from "./modules/user/routes";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.send({ message: "Ciné API running" }));
app.get("/health", (_req, res) => res.sendStatus(200));

app.use("/api/auth", authRoutes);
//app.use("/api/booking", bookingRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);

export default app;
