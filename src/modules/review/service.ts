import { firebaseDB } from '../../config/firebase';
import { Review, ReviewDocument } from './model';
import { CreateReviewDto } from './dto';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';

const REVIEW_COLLECTION = 'reviews';
const MOVIE_COLLECTION = 'movies';
const USER_COLLECTION = 'users';

export class ReviewService {
  private reviewCol = firebaseDB.collection(REVIEW_COLLECTION);
  private movieCol = firebaseDB.collection(MOVIE_COLLECTION);
  private userCol = firebaseDB.collection(USER_COLLECTION);

  /**
   * Tạo đánh giá mới
   */
  async createReview(userId: string, dto: CreateReviewDto): Promise<Review> {
    // 1. Lấy thông tin User (để lưu tên/avatar)
    const userDoc = await this.userCol.doc(userId).get();
    if (!userDoc.exists) throw new ApiError(404, 'User không tồn tại');
    const userData = userDoc.data();

    // 2. Kiểm tra User đã review phim này chưa (Mỗi người chỉ 1 review/phim)
    const existingReview = await this.reviewCol
      .where('userId', '==', userId)
      .where('movieId', '==', dto.movieId)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      throw new ApiError(400, 'Bạn đã đánh giá phim này rồi, không thể đánh giá thêm.');
    }

    // 3. Lưu Review
    const newReview: ReviewDocument = {
      userId,
      movieId: dto.movieId,
      userName: userData?.name || 'Người dùng ẩn danh',
      userAvatar: userData?.photoURL || '',
      rating: dto.rating,
      comment: dto.comment || '',
      createdAt: Timestamp.now()
    };

    const ref = await this.reviewCol.add(newReview);

    // 4. Trigger: Tính lại điểm trung bình cho Movie (Chạy bất đồng bộ để phản hồi nhanh)
    // Không cần await để user không phải chờ
    this.updateMovieRating(dto.movieId);

    return { id: ref.id, ...newReview };
  }

  /**
   * Lấy danh sách review của 1 phim
   */
  async getReviewsByMovie(movieId: string): Promise<Review[]> {
    const snapshot = await this.reviewCol
      .where('movieId', '==', movieId)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Map data và convert Timestamp -> Date (nếu cần trả về dạng Date object)
    // Ở đây giữ nguyên Timestamp hoặc client tự xử lý
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  }

  /**
   * Helper: Tính điểm trung bình và update vào Movie
   */
  private async updateMovieRating(movieId: string) {
    try {
      const snapshot = await this.reviewCol.where('movieId', '==', movieId).get();
      
      if (snapshot.empty) return;

      let totalRating = 0;
      snapshot.docs.forEach(doc => {
        totalRating += (doc.data().rating || 0);
      });

      const count = snapshot.size;
      // Tính trung bình, làm tròn 1 chữ số thập phân (VD: 4.5)
      const average = parseFloat((totalRating / count).toFixed(1));

      // Update ngược lại vào Movie
      await this.movieCol.doc(movieId).update({
        imdbRating: average, // Tận dụng trường imdbRating để hiển thị sao
        // Có thể thêm trường reviewCount vào model movie nếu muốn
        // reviewCount: count 
      });
      
      console.log(`Updated rating for movie ${movieId}: ${average} (${count} reviews)`);
    } catch (error) {
      console.error("Error updating movie rating:", error);
    }
  }
}