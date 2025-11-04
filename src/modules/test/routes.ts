import { Router } from "express";
import { testFirebaseConnection } from "./controller";

const router = Router();

router.get("/firebase-test", testFirebaseConnection);

export default router;