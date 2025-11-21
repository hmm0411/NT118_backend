import { firebaseDB } from "../../config/firebase";
import { Movie, MovieDocument } from "./model";
import { CreateMovieDto, UpdateMovieDto } from "./dto";
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION = "movies";
const moviesCollection = firebaseDB.collection(COLLECTION);

export class MovieService {

  /**
   * Lấy danh sách phim kèm logic tính toán status
   */
  async getMoviesWithStatus(): Promise<(Movie & { computedStatus: string })[]> {
    const snapshot = await moviesCollection.orderBy('createdAt', 'desc').get();
    const now = new Date();

    return snapshot.docs.map((doc) => {
      const data = doc.data() as MovieDocument;
      const movie = { id: doc.id, ...data } as Movie;
      
      // Logic ưu tiên: Nếu có field status trong DB thì dùng, nếu không thì tính theo ngày
      let computedStatus = movie.status || 'coming_soon';

      if (!movie.status && movie.releaseDate) {
          const releaseDate = new Date(movie.releaseDate);
          // Nếu ngày phát hành <= hiện tại => Đang chiếu
          computedStatus = releaseDate <= now ? "now_showing" : "coming_soon";
      }

      return { ...movie, computedStatus };
    });
  }

  async getMovieById(id: string): Promise<Movie | null> {
    const doc = await moviesCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Movie;
  }

  async createMovie(dto: CreateMovieDto): Promise<Movie> {
    const now = Timestamp.now();

    // Loại bỏ các giá trị undefined để Firestore không bị lỗi
    const cleanData = JSON.parse(JSON.stringify(dto));

    const movieDoc: MovieDocument = {
      ...cleanData,
      // Default values
      isTopMovie: dto.isTopMovie ?? false,
      status: dto.status ?? 'coming_soon',
      createdAt: now,
      updatedAt: now,
    };

    const ref = await moviesCollection.add(movieDoc);
    // Update ngược lại ID vào doc để tiện query phía client (nếu cần)
    await ref.update({ id: ref.id });
    
    return { id: ref.id, ...movieDoc } as Movie;
  }

  async updateMovie(id: string, dto: UpdateMovieDto): Promise<Movie | null> {
    const ref = moviesCollection.doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;

    // Loại bỏ undefined values
    const updateData: any = { ...dto };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    updateData.updatedAt = Timestamp.now();

    await ref.update(updateData);
    const updatedSnap = await ref.get();
    
    return { id: updatedSnap.id, ...updatedSnap.data() } as Movie;
  }

  async removeMovie(id: string): Promise<{ id: string; message: string } | null> {
    const ref = moviesCollection.doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;

    await ref.delete();
    return { id, message: "Movie deleted successfully" };
  }
}