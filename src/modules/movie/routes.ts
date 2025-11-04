import { Router } from "express";
import { searchMovies } from "./controller";

const r = Router();

// Search movies by keyword
r.get("/search", searchMovies);

export default r;
