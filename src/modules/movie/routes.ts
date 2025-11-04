import { Router } from "express";
import * as controller from "./controller";

const router = Router();

router.get("/", controller.getMovies);
router.get("/:id", controller.getMovieById);
router.post("/", controller.createMovie);
router.put("/:id", controller.updateMovie);
router.delete("/:id", controller.deleteMovie);

export default router;
