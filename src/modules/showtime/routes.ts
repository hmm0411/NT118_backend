import { Router } from "express";
import {
  handleGetAllShowtimes,
  handleCreateShowtime,
  handleUpdateShowtime,
  handleDeleteShowtime,
} from "./controller";

const router = Router();

router.get("/", handleGetAllShowtimes);
router.post("/", handleCreateShowtime);
router.patch("/:id", handleUpdateShowtime);
router.delete("/:id", handleDeleteShowtime);

export default router;
