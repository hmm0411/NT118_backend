import { firebaseDB } from "../../config/firebase";
import { Movie } from "./types";

const COLLECTION = "movies";

export async function getMoviesWithStatus(): Promise<(Movie & { status: "now_showing" | "coming_soon" })[]> {
  const snapshot = await firebaseDB.collection(COLLECTION).get();
  const now = new Date();
  
  return snapshot.docs.map((doc) => {
    const movie = { id: doc.id, ...doc.data() } as Movie;
    const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : now;

    const status: "now_showing" | "coming_soon" = releaseDate <= now ? "now_showing" : "coming_soon";

    return { ...movie, status };
  });
}

export async function getMovies(): Promise<Movie[]> {
  const snapshot = await firebaseDB.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Movie[];
}

export async function getMovieById(id: string): Promise<Movie | null> {
  const doc = await firebaseDB.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Movie;
}

export async function createMovie(data: Partial<Movie>): Promise<Movie> {
  const now = Date.now();
  const movie: Movie = {
    id: "",
    title: data.title || "Untitled",
    description: data.description || "",
    genre: data.genre || "",
    duration: data.duration || 0,
    director: data.director || "",
    cast: data.cast || [],
    releaseDate: data.releaseDate || now,
    posterUrl: data.posterUrl || "",
    trailerUrl: data.trailerUrl || "",
    createdAt: now,
    updatedAt: now,
  };
  const ref = await firebaseDB.collection(COLLECTION).add(movie);
  await ref.update({ id: ref.id });
  const snap = await ref.get();
  return snap.data() as Movie;
}

export async function updateMovie(id: string, data: Partial<Movie>): Promise<Movie | null> {
  const ref = firebaseDB.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update({ ...data, updatedAt: Date.now() });
  const updated = await ref.get();
  return updated.data() as Movie;
}

export async function removeMovie(id: string) {
  const ref = firebaseDB.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;

  await ref.delete();
  return { id, message: "Movie deleted successfully" };
}

