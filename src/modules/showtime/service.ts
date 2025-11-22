import { firebaseDB } from '../../config/firebase';
import { Showtime, ShowtimeDocument, Seat, SeatStatus, SeatType } from './model';
import { CreateShowtimeDto } from './dto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';

const SHOWTIME_COLLECTION = 'showtimes';
const MOVIE_COLLECTION = 'movies';
const CINEMA_COLLECTION = 'cinemas';

export class ShowtimeService {
  private collection = firebaseDB.collection(SHOWTIME_COLLECTION);

  private toShowtime(doc: FirebaseFirestore.DocumentSnapshot): Showtime {
    const data = doc.data() as ShowtimeDocument;
    return {
      id: doc.id,
      ...data,
      startTime: (data.startTime as Timestamp).toDate(),
      endTime: (data.endTime as Timestamp).toDate(),
      // createdAt và updatedAt xử lý tương tự nếu cần
    } as Showtime;
  }

  /**
   * Helper: Tạo sơ đồ ghế giả lập (5 hàng x 10 ghế)
   * Trong thực tế, bạn sẽ lấy layout này từ module "Room"
   */
  private generateStandardSeats(basePrice: number): Record<string, Seat> {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const cols = 10;
    const seatMap: Record<string, Seat> = {};

    rows.forEach((row) => {
      for (let i = 1; i <= cols; i++) {
        const code = `${row}${i}`;
        // Ví dụ: Hàng E là VIP, giá +20%
        const isVip = row === 'E';
        const type = isVip ? SeatType.VIP : SeatType.STANDARD;
        const price = isVip ? basePrice * 1.2 : basePrice;

        seatMap[code] = {
          code,
          row,
          col: i,
          type,
          price,
          status: SeatStatus.AVAILABLE,
        };
      }
    });

    return seatMap;
  }

  /**
   * Lấy danh sách suất chiếu theo Phim và Tỉnh (Và ngày nếu cần)
   * Đây là API chính cho màn hình "Chọn Rạp & Giờ"
   */
  async getShowtimes(movieId: string, regionId: string, date?: string): Promise<Showtime[]> {
    let query = this.collection
      .where('movieId', '==', movieId)
      .where('regionId', '==', regionId);

    // Lọc thời gian: Lấy suất chiếu > thời gian hiện tại
    const now = Timestamp.now();
    query = query.where('startTime', '>', now);

    const snapshot = await query.orderBy('startTime', 'asc').get();

    if (snapshot.empty) return [];

    const showtimes = snapshot.docs.map(this.toShowtime);

    // Nếu có lọc theo ngày cụ thể (client gửi YYYY-MM-DD)
    if (date) {
      return showtimes.filter(st => {
        const stDate = st.startTime.toISOString().split('T')[0];
        return stDate === date;
      });
    }

    return showtimes;
  }

  async getShowtimeById(id: string): Promise<Showtime | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return this.toShowtime(doc);
  }

  async createShowtime(dto: CreateShowtimeDto): Promise<Showtime> {
    // 1. Lấy thông tin Phim
    const movieDoc = await firebaseDB.collection(MOVIE_COLLECTION).doc(dto.movieId).get();
    if (!movieDoc.exists) throw new ApiError(404, 'Phim không tồn tại');
    const movieData = movieDoc.data();

    // 2. Lấy thông tin Rạp (để lấy regionId và tên rạp)
    const cinemaDoc = await firebaseDB.collection(CINEMA_COLLECTION).doc(dto.cinemaId).get();
    if (!cinemaDoc.exists) throw new ApiError(404, 'Rạp không tồn tại');
    const cinemaData = cinemaDoc.data();

    // 3. Tính toán thời gian kết thúc (dựa vào duration phim)
    const durationMinutes = parseInt(movieData?.duration || "0"); // VD: "120"
    const startTimeDate = new Date(dto.startTime);
    const endTimeDate = new Date(startTimeDate.getTime() + durationMinutes * 60000);

    // 4. Sinh ghế
    const seatMap = this.generateStandardSeats(dto.price);
    const totalSeats = Object.keys(seatMap).length;

    // 5. Tạo Doc
    const newShowtime: ShowtimeDocument = {
      movieId: dto.movieId,
      movieTitle: movieData?.title || "Unknown Movie",
      
      cinemaId: dto.cinemaId,
      cinemaName: cinemaData?.name || "Unknown Cinema",
      regionId: cinemaData?.regionId || "", // Quan trọng: Lưu regionId từ rạp sang
      
      roomName: dto.roomName,
      startTime: Timestamp.fromDate(startTimeDate),
      endTime: Timestamp.fromDate(endTimeDate),
      
      seatMap: seatMap,
      totalSeats: totalSeats,
      availableSeats: totalSeats,
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const ref = await this.collection.add(newShowtime);
    const newDoc = await ref.get();
    return this.toShowtime(newDoc);
  }
}