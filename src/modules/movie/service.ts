import { firebaseDB } from "../../config/firebase";
import { Movie, MovieDocument } from "./model";
import { CreateMovieDto, UpdateMovieDto } from "./dto";
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const COLLECTION = "movies";
const moviesCollection = firebaseDB.collection(COLLECTION);

export class MovieService {

  /**
   * Lấy danh sách phim kèm trạng thái (đang chiếu / sắp chiếu)
   */
  async getMoviesWithStatus(): Promise<(Movie & { status: "now_showing" | "coming_soon" })[]> {
    const snapshot = await moviesCollection.get();
    const now = new Date();

    return snapshot.docs.map((doc) => {
      const movie = { id: doc.id, ...doc.data() } as Movie;
      
      let status: "now_showing" | "coming_soon" = "coming_soon";
      // Xử lý logic status (dùng releaseDate hoặc status trong DB)
      if (movie.status && movie.status !== 'ended') {
          status = movie.status;
      } else if (movie.releaseDate) {
          const releaseDate = new Date(movie.releaseDate);
          status = releaseDate <= now ? "now_showing" : "coming_soon";
      }

      return { ...movie, status };
    });
  }

  /**
   * Lấy phim theo ID
   */
  async getMovieById(id: string): Promise<Movie | null> {
    const doc = await moviesCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Movie;
  }

  /**
   * Tạo phim mới
   */
  async createMovie(dto: CreateMovieDto): Promise<Movie> {
    const now = Timestamp.now();

    const movieDoc: MovieDocument = {
      ...dto,
      title: dto.title,
      // Đặt giá trị default cho các trường optional
      description: dto.description || "",
      genres: dto.genres || [],
      duration: dto.duration || "0",
      director: dto.director || "",
      cast: dto.cast || [],
      releaseDate: dto.releaseDate || "",
      posterUrl: dto.posterUrl || "",
      bannerImageUrl: dto.bannerImageUrl || "",
      trailerUrl: dto.trailerUrl || "",
      imdbRating: dto.imdbRating || 0,
      language: dto.language || "",
      status: dto.status || "coming_soon",
      isTopMovie: dto.isTopMovie || false,
      ageRating: dto.ageRating || "",
      // Dùng Timestamp
      createdAt: now,
      updatedAt: now,
    };

    const ref = await moviesCollection.add(movieDoc);
    // Cập nhật ID vào document (tốt cho query)
    await ref.update({ id: ref.id }); 
    const snap = await ref.get();
    
    return { id: snap.id, ...snap.data() } as Movie;
  }

  /**
   * Cập nhật phim
   */
  async updateMovie(id: string, dto: UpdateMovieDto): Promise<Movie | null> {
    const ref = moviesCollection.doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;

    // Chuyển DTO thành object sạch, loại bỏ undefined
    const updateData: Record<string, any> = { ...dto };
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    updateData.updatedAt = Timestamp.now();

    await ref.update(updateData);
    const updated = await ref.get();
    return { id: updated.id, ...updated.data() } as Movie;
  }

  /**
   * Xóa phim
   */
  async removeMovie(id: string): Promise<{ id: string; message: string } | null> {
    const ref = moviesCollection.doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;

    await ref.delete();
    return { id, message: "Movie deleted successfully" };
  }
}