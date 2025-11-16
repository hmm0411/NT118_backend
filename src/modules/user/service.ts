import { firebaseDB } from '../../config/firebase';
import { User, UserDocument, BookingHistoryItem } from './model';
import { UpdateUserDto } from './dto';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// Tham chiếu đến các collection
const usersCollection = firebaseDB.collection('users');
const ticketsCollection = firebaseDB.collection('tickets');

/**
 * Lớp UserService chứa tất cả logic nghiệp vụ
 * liên quan đến người dùng.
 */
export class UserService {

  /**
   * Lấy thông tin người dùng bằng ID
   */
  async getUserById(id: string): Promise<User | null> {
    const doc = await usersCollection.doc(id).get();

    if (!doc.exists) {
      return null;
    }
    // Kết hợp id của doc và data
    return { id: doc.id, ...doc.data() } as User;
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<void> {
    // Chuyển DTO thành một object sạch để update
    // Điều này đảm bảo client không thể "bơm" các trường
    // linh tinh (như roles: 'admin') vào updateData.
    const updateData: Record<string, any> = { ...dto };

    // Xóa các key có giá trị undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Thêm timestamp cập nhật
    updateData.updatedAt = Timestamp.now();

    await usersCollection.doc(id).update(updateData);
  }

  /**
   * Lấy lịch sử đặt vé của người dùng
   */
  async getUserBookings(userId: string): Promise<BookingHistoryItem[]> {
    const snapshot = await ticketsCollection
      .where('userId', '==', userId)
      // .orderBy('createdAt', 'desc') // Bỏ comment nếu bạn đã tạo index
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BookingHistoryItem));

    // Sắp xếp bằng code (an toàn, không cần index)
    // Firestore sẽ báo lỗi nếu bạn dùng .orderBy mà không có index
    return data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }
}