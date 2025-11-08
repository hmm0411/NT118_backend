import { Router } from "express";
import {
  handleGetAllShowtimes,
  handleCreateShowtime,
  handleUpdateShowtime,
  handleDeleteShowtime,
} from "./controller";
import { auth, optionalAuth, isAdmin } from "../../middleware/auth";

const router = Router();

router.get("/", handleGetAllShowtimes);
router.post("/", auth, handleCreateShowtime);
router.patch("/:id", auth, handleUpdateShowtime);
router.delete("/:id", auth, handleDeleteShowtime);

export default router;
