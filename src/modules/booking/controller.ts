import { Request, Response, NextFunction } from "express";
import { firebaseDB } from "../../config/firebase";
import { v4 as uuid } from "uuid";
import admin from "firebase-admin";

/**
 * Lấy danh sách ghế cho một suất chiếu cụ thể
 */
export async function getSeats(req: Request, res: Response, next: NextFunction) {
    try {
        const showId = req.params.id;

        const snapshot = await firebaseDB
            .collection("seats")
            .where("showId", "==", showId)
            .get();

        const seats = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json({ success: true, data: seats });
    } catch (error) {
        console.error("getSeats error:", error);
        next(error);
    }
}

/**
 * Đặt tạm ghế (lock seats trong 5 phút)
 */
export async function lockSeats(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
) {
    try {
        const { showId, seats } = req.body;
        const userId = req.user?.id;
        if (!showId || !Array.isArray(seats) || seats.length === 0) {
            res.status(400).json({ success: false, message: "Invalid request body" });
            return;
        }

        const lockId = uuid();
        const lockRef = firebaseDB.collection("seatLocks").doc(lockId);

        // Dùng transaction để đảm bảo tất cả ghế đều lock được atomically
        await firebaseDB.runTransaction(async (transaction) => {
            const seatSnapshots = await Promise.all(
                seats.map(async (seatCode: string) => {
                    const querySnap = await transaction.get(
                        firebaseDB
                            .collection("seats")
                            .where("showId", "==", showId)
                            .where("seatCode", "==", seatCode)
                            .limit(1)
                    );
                    return querySnap;
                })
            );

            // Kiểm tra có ghế nào không tồn tại hoặc đang không khả dụng
            if (seatSnapshots.some((snap) => snap.empty)) {
                throw new Error("One or more seats are not available");
            }

            // Cập nhật tất cả ghế thành "locked"
            seatSnapshots.forEach((snap) => {
                const seatRef = snap.docs[0].ref;
                transaction.update(seatRef, { status: "locked", lockId });
            });

            // Tạo document lock ghế riêng
            transaction.set(lockRef, {
                userId,
                showId,
                seats,
                status: "active",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 5 * 60 * 1000), // 5 phút
            });
        });

        res.json({
            success: true,
            lockId,
            expires: 300,
            message: "Seats locked for 5 minutes",
        });
    } catch (error) {
        console.error("lockSeats error:", error);
        next(error);
    }
}
