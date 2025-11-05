import { Router } from 'express';
import * as cinemaController from './controller';

const router = Router();

router.get('/', cinemaController.handleGetAllCinemas);
router.post('/', cinemaController.handleCreateCinema);
router.patch('/:id', cinemaController.handleUpdateCinema);
router.delete('/:id', cinemaController.handleDeleteCinema);

export default router;
