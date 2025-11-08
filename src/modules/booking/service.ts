// service.ts
import { firebaseDB } from '../../config/firebase';
import { Booking } from './types';

const BOOKINGS_COLLECTION = 'bookings';

export const createBooking = async (data: Booking): Promise<Booking> => {
  const ref = await firebaseDB.collection(BOOKINGS_COLLECTION).add({
    ...data,
    createdAt: new Date(),
  });
  const snapshot = await ref.get();
  return { id: ref.id, ...snapshot.data() } as Booking;
};

export const getBookingsByUser = async (userId: string): Promise<Booking[]> => {
  const snapshot = await firebaseDB.collection(BOOKINGS_COLLECTION).where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Booking[];
};
