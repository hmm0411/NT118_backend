import { Router } from "express";
import * as controller from "./controller";
import { auth, optionalAuth, isAdmin } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/", optionalAuth, controller.getMovies);
router.get("/:id", optionalAuth, controller.getMovieById);


router.post("/", auth, controller.createMovie);
router.put("/:id", auth, controller.updateMovie);
router.delete("/:id", auth, controller.deleteMovie);

export default router;
