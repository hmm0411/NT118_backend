import { Request, Response } from "express";
import { firebaseDB } from "../../config/firebase";

// Tìm kiếm phim theo từ khóa trong tiêu đề, thể loại hoặc diễn viên
export async function searchMovies(req: Request, res: Response): Promise<void> {
    try {
        const q = (req.query.q as string || "").toLowerCase().trim();
        if (!q) {
            res.status(400).json({ success: false, message: "Missing search keyword (q)" });
            return;
        }

        const snapshot = await firebaseDB.collection("movies").get();
        const results: any[] = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const title = (data.title || "").toLowerCase();
            const genre = Array.isArray(data.genre) ? data.genre.map((g: string) => g.toLowerCase()) : [];
            const actors = Array.isArray(data.actors) ? data.actors.map((a: string) => a.toLowerCase()) : [];

            if (
                title.includes(q) ||
                genre.some((g: string) => g.includes(q)) ||
                actors.some((a: string) => a.includes(q))
            ) {
                results.push({ id: doc.id, ...data });
            }
        });

        res.json({ success: true, count: results.length, movies: results });
    } catch (error: any) {
        console.error("Search error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}
