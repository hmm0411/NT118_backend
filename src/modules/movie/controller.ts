import { Request, Response } from "express";
import { MovieService } from "./service";
import { CreateMovieDto, UpdateMovieDto } from "./dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

// Khởi tạo service
const movieService = new MovieService();

/**
 * @swagger
 * tags:
 * name: Movies
 * description: Quản lý phim
 *
 * components:
 * schemas:
 * Movie:
 * type: object
 * properties:
 * id:
 * type: string
 * description: Mã phim
 * title:
 * type: string
 * description: Tên phim
 * description:
 * type: string
 * description: Mô tả phim
 * genres:
 * type: array
 * description: Thể loại phim
 * items: { type: string }
 * duration:
 * type: string
 * description: Thời lượng phim (phút)
 * director:
 * type: string
 * cast:
 * type: array
 * items: { type: string }
 * releaseDate:
 * type: string
 * description: Ngày phát hành (ISO date string)
 * posterUrl:
 * type: string
 * format: uri
 * bannerImageUrl:
 * type: string
 * format: uri
 * trailerUrl:
 * type: string
 * format: uri
 * imdbRating:
 * type: number
 * language:
 * type: string
 * status:
 * type: string
 * enum: [now_showing, coming_soon, ended]
 * isTopMovie:
 * type: boolean
 * ageRating:
 * type: string
 * createdAt:
 * type: string
 * format: date-time
 * description: Timestamp (Firestore)
 * updatedAt:
 * type: string
 * format: date-time
 * description: Timestamp (Firestore)
 *
 * CreateMovieDto:
 * type: object
 * properties:
 * title: { type: string, required: true }
 * description: { type: string }
 * genres: { type: array, items: { type: string } }
 * duration: { type: string }
 * director: { type: string }
 * cast: { type: array, items: { type: string } }
 * releaseDate: { type: string, format: date-time }
 * posterUrl: { type: string, format: uri }
 * bannerImageUrl: { type: string, format: uri }
 * trailerUrl: { type: string, format: uri }
 * imdbRating: { type: number }
 * language: { type: string }
 * status: { type: string, enum: [now_showing, coming_soon, ended] }
 * isTopMovie: { type: boolean }
 * ageRating: { type: string }
 *
 * UpdateMovieDto:
 * type: object
 * properties:
 * title: { type: string }
 * description: { type: string }
 * genres: { type: array, items: { type: string } }
 * duration: { type: string }
 * director: { type: string }
 * cast: { type: array, items: { type: string } }
 * releaseDate: { type: string, format: date-time }
 * posterUrl: { type: string, format: uri }
 * bannerImageUrl: { type: string, format: uri }
 * trailerUrl: { type: string, format: uri }
 * imdbRating: { type: number }
 * language: { type: string }
 * status: { type: string, enum: [now_showing, coming_soon, ended] }
 * isTopMovie: { type: boolean }
 * ageRating: { type: string }
 */

/**
 * @swagger
 * /api/movies:
 * get:
 * summary: Lấy danh sách phim (kèm trạng thái)
 * tags: [Movies]
 * responses:
 * 200:
 * description: Danh sách phim
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Movie'
 */
export async function getMovies(req: Request, res: Response) {
  try {
    const data = await movieService.getMoviesWithStatus();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{id}:
 * get:
 * summary: Lấy chi tiết phim
 * tags: [Movies]
 * parameters:
 * - { in: path, name: id, required: true, schema: { type: string } }
 * responses:
 * 200:
 * description: Chi tiết phim
 * content: { application/json: { schema: { $ref: '#/components/schemas/Movie' } } }
 * 404:
 * description: Không tìm thấy phim
 */
export async function getMovieById(req: Request, res: Response) {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies:
 * post:
 * summary: Thêm phim mới
 * tags: [Movies]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CreateMovieDto'
 * responses:
 * 211:
 * description: Tạo thành công
 * content: { application/json: { schema: { $ref: '#/components/schemas/Movie' } } }
 * 400:
 * description: Dữ liệu đầu vào không hợp lệ
 */
export async function createMovie(req: Request, res: Response) {
  try {
    // 1. Chuyển req.body thành DTO
    const dto = plainToInstance(CreateMovieDto, req.body);
    
    // 2. Validate DTO
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // 3. Gọi service với DTO đã validate
    const movie = await movieService.createMovie(dto);
    res.status(201).json(movie);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{id}:
 * put:
 * summary: Cập nhật phim
 * tags: [Movies]
 * parameters:
 * - { in: path, name: id, required: true, schema: { type: string } }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UpdateMovieDto'
 * responses:
 * 200:
 * description: Cập nhật thành công
 * content: { application/json: { schema: { $ref: '#/components/schemas/Movie' } } }
 * 400:
 * description: Dữ liệu đầu vào không hợp lệ
 * 404:
 * description: Không tìm thấy phim
 */
export async function updateMovie(req: Request, res: Response) {
  try {
    // 1. Chuyển req.body thành DTO
    const dto = plainToInstance(UpdateMovieDto, req.body);

    // 2. Validate DTO (cho phép thiếu trường)
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // 3. Gọi service
    const updated = await movieService.updateMovie(req.params.id, dto);
    if (!updated) return res.status(404).json({ message: "Movie not found" });
    
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{id}:
 * delete:
 * summary: Xóa phim
 * tags: [Movies]
 * parameters:
 * - { in: path, name: id, required: true, schema: { type: string } }
 * responses:
 * 200:
 * description: Xóa thành công
 * 404:
 * description: Không tìm thấy phim
 */
export async function deleteMovie(req: Request, res: Response) {
  try {
    const result = await movieService.removeMovie(req.params.id);
    if (!result)
      return res.status(404).json({ success: false, message: "Movie not found" });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}