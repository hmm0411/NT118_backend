// src/modules/booking/controller.ts
import { Request, Response } from 'express';
import * as service from './service';
import { CreateBookingDTO, ConfirmPaymentDTO } from './dto';

export async function getShowtimes(req: Request, res: Response) {
  try {
    const { movieId, dateFrom, dateTo } = req.query;
    const filter: any = {};
    if (movieId) filter.movieId = String(movieId);
    if (dateFrom) filter.dateFrom = Number(dateFrom);
    if (dateTo) filter.dateTo = Number(dateTo);
    const showtimes = await service.getShowtimes(filter);
    res.json(showtimes);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal error' });
  }
}

export async function getShowtimeDetail(req: Request, res: Response) {
  try {
    const showtime = await service.getShowtimeDetail(req.params.id);
    res.json(showtime);
  } catch (err: any) {
    res.status(404).json({ message: err.message || 'Not found' });
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const body = req.body as CreateBookingDTO;
    const result = await service.createBooking(userId, body);

    // trả booking tạm thời + payment hint
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Bad request' });
  }
}

/**
 * Endpoint gọi từ payment gateway webhook hoặc frontend sau thanh toán
 */
export async function confirmPayment(req: Request, res: Response) {
  try {
    const body = req.body as ConfirmPaymentDTO;
    const updated = await service.confirmPayment(body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Bad request' });
  }
}

export async function getMyBookings(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const bookings = await service.getUserBookings(userId);
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal error' });
  }
}

export async function cancelBooking(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    const canceled = await service.cancelBooking(userId, id);
    res.json(canceled);
  } catch (err: any) {
    const msg = err.message || 'Bad request';
    if (msg.includes('Permission') || msg.includes('not found')) return res.status(403).json({ message: msg });
    res.status(400).json({ message: msg });
  }
}
