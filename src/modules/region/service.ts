import { Region, RegionDocument } from './model';
import { CreateRegionDto, UpdateRegionDto } from './dto';
import { firebaseDB } from '../../config/firebase';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError'; // Import lỗi từ file util

const REGION_COLLECTION = 'regions';

export class RegionService {
  private collection = firebaseDB.collection(REGION_COLLECTION);

  /**
   * Chuyển đổi DocumentData sang interface Region
   */
  private toRegion(doc: FirebaseFirestore.DocumentSnapshot): Region {
    const data = doc.data() as RegionDocument;
    return {
      id: doc.id,
      name: data.name,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  /**
   * Lấy tất cả khu vực
   */
  async getAllRegions(): Promise<Region[]> {
    const snapshot = await this.collection.orderBy('name', 'asc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(this.toRegion);
  }

  /**
   * Tạo khu vực mới (Admin)
   */
  async createRegion(data: CreateRegionDto): Promise<Region> {
    const { name } = data;

    // Kiểm tra trùng tên
    const existingSnapshot = await this.collection.where('name', '==', name).limit(1).get();
    if (!existingSnapshot.empty) {
      throw new ApiError(400, 'Tên khu vực đã tồn tại');
    }

    const newRegionData = {
      name,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await this.collection.add(newRegionData);
    const newDoc = await docRef.get();
    
    return this.toRegion(newDoc);
  }

  /**
   * Cập nhật khu vực (Admin)
   */
  async updateRegion(regionId: string, data: UpdateRegionDto): Promise<Region> {
    const docRef = this.collection.doc(regionId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new ApiError(404, 'Không tìm thấy khu vực');
    }

    // Kiểm tra trùng tên nếu có thay đổi
    if (data.name) {
      const existingSnapshot = await this.collection.where('name', '==', data.name).limit(1).get();
      if (!existingSnapshot.empty && existingSnapshot.docs[0].id !== regionId) {
        throw new ApiError(400, 'Tên khu vực đã tồn tại');
      }
    }

    const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return this.toRegion(updatedDoc);
  }

  /**
   * Xóa khu vực (Admin)
   */
  async deleteRegion(regionId: string): Promise<void> {
    const docRef = this.collection.doc(regionId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new ApiError(404, 'Không tìm thấy khu vực');
    }

    // Kiểm tra ràng buộc: khu vực đang có rạp
    const cinemaSnapshot = await firebaseDB.collection('cinemas')
      .where('regionId', '==', regionId)
      .limit(1)
      .get();

    if (!cinemaSnapshot.empty) {
      throw new ApiError(400, 'Không thể xóa khu vực đang có rạp chiếu phim');
    }

    await docRef.delete();
  }
}