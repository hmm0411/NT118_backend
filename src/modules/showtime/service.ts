import { firebaseDB } from "../../config/firebase";
import { Showtime } from "./types";

const COLLECTION = "showtimes";

export const getAll = async (): Promise<Showtime[]> => {
  const snapshot = await firebaseDB.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Showtime[];
};

export const getByMovie = async (movieId: string): Promise<Showtime[]> => {
  const snapshot = await firebaseDB.collection(COLLECTION).where("movieId", "==", movieId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Showtime[];
};

export const getByCinema = async (cinemaId: string): Promise<Showtime[]> => {
  const snapshot = await firebaseDB.collection(COLLECTION).where("cinemaId", "==", cinemaId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Showtime[];
};

export const getById = async (id: string): Promise<Showtime | null> => {
  const docRef = firebaseDB.collection(COLLECTION).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Showtime;
};

export const getByMovieAndCinema = async (movieId: string, cinemaId: string): Promise<Showtime[]> => {
  const snapshot = await firebaseDB
    .collection(COLLECTION)
    .where("movieId", "==", movieId)
    .where("cinemaId", "==", cinemaId)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Showtime[];
};

export const create = async (data: any): Promise<Showtime> => {
  const payload = {
    ...data,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await firebaseDB.collection(COLLECTION).add(payload);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() } as Showtime;
};

export const update = async (id: string, data: any): Promise<Showtime | null> => {
  const docRef = firebaseDB.collection(COLLECTION).doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;

  const payload: any = {
    ...data,
    updatedAt: new Date(),
  };

  if (data.startTime) payload.startTime = new Date(data.startTime);
  if (data.endTime) payload.endTime = new Date(data.endTime);

  await docRef.update(payload);
  const updated = await docRef.get();
  return { id: updated.id, ...updated.data() } as Showtime;
};

export const remove = async (id: string): Promise<boolean> => {
  const docRef = firebaseDB.collection(COLLECTION).doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return false;
  await docRef.delete();
  return true;
};
