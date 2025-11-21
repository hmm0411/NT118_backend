import { Cinema, CinemaDocument } from './model';
import { CreateCinemaDto, UpdateCinemaDto } from './dto';
import { firebaseDB } from '../../config/firebase';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError'; // <-- SỬA IMPORT Ở ĐÂY

const CINEMA_COLLECTION = 'cinemas';
const REGION_COLLECTION = 'regions';

export class CinemaService {
  private collection = firebaseDB.collection(CINEMA_COLLECTION);

  /**
   * Chuyển đổi DocumentData sang interface Cinema
   */
  private toCinema(doc: FirebaseFirestore.DocumentSnapshot): Cinema {
    const data = doc.data() as CinemaDocument;
    return {
      id: doc.id,
      name: data.name,
      address: data.address,
      regionId: data.regionId,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  }

  async getAllCinemas(): Promise<Cinema[]> {
    const snapshot = await this.collection.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(this.toCinema);
  }

  async createCinema(data: CreateCinemaDto): Promise<Cinema> {
    const { name, address, regionId } = data;

    // Kiểm tra region tồn tại
    const regionDoc = await firebaseDB.collection(REGION_COLLECTION).doc(regionId).get();
    if (!regionDoc.exists) {
      throw new ApiError(400, 'Khu vực (Region) không tồn tại');
    }

    const newCinema: CinemaDocument = {
      name,
      address,
      regionId,
      createdAt: Timestamp.now(), // Dùng Timestamp.now() thay vì FieldValue
      updatedAt: Timestamp.now(), // Dùng Timestamp.now() thay vì FieldValue
    };

    const docRef = await this.collection.add(newCinema);
    const newDoc = await docRef.get();
    
    return this.toCinema(newDoc);
  }

  async updateCinema(id: string, data: UpdateCinemaDto): Promise<Cinema> {
    const docRef = this.collection.doc(id);
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      throw new ApiError(404, 'Không tìm thấy rạp');
    }

    // Kiểm tra region mới nếu có thay đổi
    if (data.regionId) {
      const regionDoc = await firebaseDB.collection(REGION_COLLECTION).doc(data.regionId).get();
      if (!regionDoc.exists) {
        throw new ApiError(400, 'Khu vực (Region) mới không tồn tại');
      }
    }

    const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return this.toCinema(updatedDoc);
  }

  async deleteCinema(id: string): Promise<void> {
    const docRef = this.collection.doc(id);
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      throw new ApiError(404, 'Không tìm thấy rạp');
    }

    // TODO (Nên thêm): Kiểm tra ràng buộc
    // Ví dụ: Không cho xóa rạp khi đang có 'showtimes' (suất chiếu)
    const showtimeSnapshot = await firebaseDB.collection('showtimes')
      .where('cinemaId', '==', id)
      .limit(1)
      .get();
      
    if (!showtimeSnapshot.empty) {
        throw new ApiError(400, 'Không thể xóa rạp đang có suất chiếu');
    }

    await docRef.delete();
  }
}