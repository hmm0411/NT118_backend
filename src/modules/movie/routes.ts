import { Router } from "express";
import * as controller from "./controller";
import { auth, optionalAuth, isAdmin } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/", optionalAuth, controller.getMovies);
router.get("/:id", optionalAuth, controller.getMovieById);


router.post("/", auth, isAdmin, controller.createMovie);
router.put("/:id", auth, isAdmin, controller.updateMovie);
router.delete("/:id", auth, isAdmin, controller.deleteMovie);

export default router;
