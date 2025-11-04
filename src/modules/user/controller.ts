import { Request, Response } from "express";
import { firebaseDB } from "../../config/firebase";

/**
 * GET /users/:id
 * Lấy thông tin người dùng
 */
export async function getUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const doc = await firebaseDB.collection("users").doc(id).get();

        if (!doc.exists) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.json({ success: true, data: { id: doc.id, ...doc.data() } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * PUT /users/:id
 * Cập nhật thông tin người dùng
 */
export async function updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        await firebaseDB.collection("users").doc(id).update({
            ...updateData,
            updatedAt: new Date().toISOString(),
        });

        res.json({ success: true, message: "User updated successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * GET /users/:id/bookings
 * Lấy danh sách lịch sử đặt vé
 */
export async function getBookings(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const snapshot = await firebaseDB
            .collection("tickets")
            .where("userId", "==", id)
            .orderBy("createdAt", "desc")
            .get();

        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        res.json({ success: true, bookings: data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
