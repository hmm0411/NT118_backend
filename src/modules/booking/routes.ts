import { Router } from "express";
import { auth } from "../../middleware/auth";
import * as ctrl from "./controller";
const r = Router();

r.get("/shows/:id/seats", ctrl.getSeats);
r.post("/lock", auth, ctrl.lockSeats);

export default r;
