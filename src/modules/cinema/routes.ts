import { Router } from 'express';
import * as cinemaController from './controller';
import { auth, optionalAuth, isAdmin } from "../../middleware/auth";

const router = Router();

router.get('/', cinemaController.handleGetAllCinemas);

router.post('/', auth, cinemaController.handleCreateCinema);
router.patch('/:id', auth, cinemaController.handleUpdateCinema);
router.delete('/:id', auth, cinemaController.handleDeleteCinema);

export default router;
