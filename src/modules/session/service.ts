import { firebaseDB } from '../../config/firebase';
import { CreateSessionDto } from './dto';
import { Session } from './types';

const COLLECTION = 'session';

// 🟢 Lấy tất cả sessions
export const getAllSessions = async (): Promise<Session[]> => {
  const snapshot = await firebaseDB.collection(COLLECTION).get();
  const result: Session[] = [];
  snapshot.forEach((doc) => {
    result.push({ id: doc.id, ...(doc.data() as Session) });
  });
  return result;
};

// 🟢 Lấy session theo movieId
export const getSessionsByMovie = async (movieId: string): Promise<Session[]> => {
  const snapshot = await firebaseDB.collection(COLLECTION).where('movieId', '==', movieId).get();
  const result: Session[] = [];
  snapshot.forEach((doc) => {
    result.push({ id: doc.id, ...(doc.data() as Session) });
  });
  return result;
};

// 🟢 Tạo session mới
export const createSession = async (data: CreateSessionDto): Promise<string> => {
  const docRef = await firebaseDB.collection(COLLECTION).add(data);
  return docRef.id;
};

// 🟢 Lấy session theo id
export const getSessionById = async (id: string): Promise<Session | null> => {
  const doc = await firebaseDB.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Session) };
};
