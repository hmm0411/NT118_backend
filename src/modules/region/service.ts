import { Region, RegionDocument } from './model';
import { CreateRegionDto, UpdateRegionDto } from './dto';
import { firebaseDB } from '../../config/firebase';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';

const REGION_COLLECTION = 'regions';

export class RegionService {
  private collection = firebaseDB.collection(REGION_COLLECTION);

  private toRegion(doc: FirebaseFirestore.DocumentSnapshot): Region {
    const data = doc.data() as RegionDocument;
    return {
      id: doc.id,
      name: data.name,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  async getAllRegions(): Promise<Region[]> {
    const snapshot = await this.collection.orderBy('name', 'asc').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(this.toRegion);
  }

  async createRegion(data: CreateRegionDto): Promise<Region> {
    const { name } = data;

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

  async updateRegion(regionId: string, data: UpdateRegionDto): Promise<Region> {
    const docRef = this.collection.doc(regionId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new ApiError(404, 'Không tìm thấy khu vực');
    }

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

  async deleteRegion(regionId: string): Promise<void> {
    const docRef = this.collection.doc(regionId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new ApiError(404, 'Không tìm thấy khu vực');
    }

    // Logic này rất tốt: Không cho xóa Tỉnh nếu Tỉnh đó đang có Rạp
    // Lưu ý: Cần đảm bảo collection 'cinemas' tồn tại hoặc code sẽ trả về empty (vẫn an toàn)
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