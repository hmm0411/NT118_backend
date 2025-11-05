// src/modules/region/service.ts

import { IRegion } from './types';
import { CreateRegionDto, UpdateRegionDto } from './dto';
import { firebaseDB } from '../../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * ApiError chuẩn cho service
 */
export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const REGION_COLLECTION = 'regions';

/**
 * Lấy tất cả khu vực
 */
export const getAllRegions = async (): Promise<IRegion[]> => {
  const snapshot = await firebaseDB.collection(REGION_COLLECTION)
    .orderBy('name', 'asc')
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    };
  });
};

/**
 * Tạo khu vực mới (Admin)
 */
export const createRegion = async (data: CreateRegionDto): Promise<IRegion> => {
  const { name } = data;

  // Kiểm tra trùng tên
  const existingSnapshot = await firebaseDB.collection(REGION_COLLECTION)
    .where('name', '==', name)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) throw new ApiError(400, 'Tên khu vực đã tồn tại');

  const newRegionData = {
    name,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Thêm document
  const docRef = await firebaseDB.collection(REGION_COLLECTION).add(newRegionData);
  const newDoc = await docRef.get();
  const docData = newDoc.data();

  if (!docData) throw new ApiError(500, 'Lỗi khi tạo khu vực');

  return {
    id: newDoc.id,
    name: docData.name,
    createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(),
    updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate() : new Date(),
  };
};

/**
 * Cập nhật khu vực (Admin)
 */
export const updateRegion = async (regionId: string, data: UpdateRegionDto): Promise<IRegion> => {
  const docRef = firebaseDB.collection(REGION_COLLECTION).doc(regionId);
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) throw new ApiError(404, 'Không tìm thấy khu vực');

  // Kiểm tra trùng tên nếu có thay đổi
  if (data.name) {
    const existingSnapshot = await firebaseDB.collection(REGION_COLLECTION)
      .where('name', '==', data.name)
      .limit(1)
      .get();

    if (!existingSnapshot.empty && existingSnapshot.docs[0].id !== regionId) {
      throw new ApiError(400, 'Tên khu vực đã tồn tại');
    }
  }

  const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
  await docRef.update(updateData);

  const updatedDoc = await docRef.get();
  const updatedData = updatedDoc.data();

  if (!updatedData) throw new ApiError(500, 'Lỗi khi lấy dữ liệu sau cập nhật');

  return {
    id: updatedDoc.id,
    name: updatedData.name,
    createdAt: updatedData.createdAt?.toDate ? updatedData.createdAt.toDate() : new Date(),
    updatedAt: updatedData.updatedAt?.toDate ? updatedData.updatedAt.toDate() : new Date(),
  };
};

/**
 * Xóa khu vực (Admin)
 */
export const deleteRegion = async (regionId: string): Promise<void> => {
  const docRef = firebaseDB.collection(REGION_COLLECTION).doc(regionId);
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) throw new ApiError(404, 'Không tìm thấy khu vực');

  // Kiểm tra ràng buộc: khu vực đang có rạp
  const cinemaSnapshot = await firebaseDB.collection('cinemas')
    .where('regionId', '==', regionId)
    .limit(1)
    .get();

  if (!cinemaSnapshot.empty) throw new ApiError(400, 'Không thể xóa khu vực đang có rạp chiếu phim');

  await docRef.delete();
};
