import { Request, Response, NextFunction } from 'express';
import * as sessionService from './service';
import { CreateSessionDto } from './dto';

/**
 * @swagger
 * tags:
 *   - name: Session
 *     description: API quản lý suất chiếu (session)
 */

export const getAllSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await sessionService.getAllSessions();
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const getSessionsByMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId } = req.params;
    const sessions = await sessionService.getSessionsByMovie(movieId);
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: CreateSessionDto = req.body;
    const id = await sessionService.createSession(body);
    res.status(201).json({ success: true, message: 'Session created', id });
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const session = await sessionService.getSessionById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};
