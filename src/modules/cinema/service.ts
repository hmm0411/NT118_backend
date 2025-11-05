import { ICinema } from './types';
import { CreateCinemaDto, UpdateCinemaDto } from './dto';
import { firebaseDB } from '../../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { ApiError } from '../region/service'; // hoặc định nghĩa lại ApiError

const CINEMA_COLLECTION = 'cinemas';
const REGION_COLLECTION = 'regions';

export const getAllCinemas = async (): Promise<ICinema[]> => {
  const snapshot = await firebaseDB.collection(CINEMA_COLLECTION).get();
  if (snapshot.empty) return [];

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      address: data.address,
      regionId: data.regionId,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    };
  });
};

export const createCinema = async (data: CreateCinemaDto): Promise<ICinema> => {
  const { name, address, regionId } = data;

  // Kiểm tra region tồn tại
  const regionDoc = await firebaseDB.collection(REGION_COLLECTION).doc(regionId).get();
  if (!regionDoc.exists) throw new ApiError(400, 'Region không tồn tại');

  const newCinema = {
    name,
    address,
    regionId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const docRef = await firebaseDB.collection(CINEMA_COLLECTION).add(newCinema);
  const docData = (await docRef.get()).data();
  if (!docData) throw new ApiError(500, 'Lỗi khi tạo rạp');

  return {
    id: docRef.id,
    name: docData.name,
    address: docData.address,
    regionId: docData.regionId,
    createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(),
    updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate() : new Date(),
  };
};

export const updateCinema = async (id: string, data: UpdateCinemaDto): Promise<ICinema> => {
  const docRef = firebaseDB.collection(CINEMA_COLLECTION).doc(id);
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) throw new ApiError(404, 'Không tìm thấy rạp');

  // Kiểm tra region mới nếu có
  if (data.regionId) {
    const regionDoc = await firebaseDB.collection(REGION_COLLECTION).doc(data.regionId).get();
    if (!regionDoc.exists) throw new ApiError(400, 'Region không tồn tại');
  }

  const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
  await docRef.update(updateData);

  const updatedData = (await docRef.get()).data();
  if (!updatedData) throw new ApiError(500, 'Lỗi khi lấy dữ liệu rạp');

  return {
    id: docRef.id,
    name: updatedData.name,
    address: updatedData.address,
    regionId: updatedData.regionId,
    createdAt: updatedData.createdAt?.toDate ? updatedData.createdAt.toDate() : new Date(),
    updatedAt: updatedData.updatedAt?.toDate ? updatedData.updatedAt.toDate() : new Date(),
  };
};

export const deleteCinema = async (id: string): Promise<void> => {
  const docRef = firebaseDB.collection(CINEMA_COLLECTION).doc(id);
  const docSnapshot = await docRef.get();
  if (!docSnapshot.exists) throw new ApiError(404, 'Không tìm thấy rạp');

  await docRef.delete();
};
