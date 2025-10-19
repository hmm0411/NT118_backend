import { Request, Response, NextFunction } from "express";
import { db } from "../../config/db";
import { redis } from "../../config/redis";
import { v4 as uuid } from "uuid";

export async function getSeats(req: Request, res: Response, next: NextFunction) {
    try {
        const [rows] = await db.query("SELECT seat_code, status FROM seats WHERE show_id=?", [req.params.id]);
        res.json(rows);
    } catch (e) { next(e); }
}

export async function lockSeats(req: Request & { user?: any }, res: Response, next: NextFunction) {
    try {
        const { showId, seats } = req.body;
        const lockId = uuid();
        const key = `lock:${showId}:${lockId}`;
        await redis.setEx(key, 300, JSON.stringify({ userId: req.user!.id, seats }));
        res.json({ lockId, expires: 300 });
    } catch (e) { next(e); }
}
