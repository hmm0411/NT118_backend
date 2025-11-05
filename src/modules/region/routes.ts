// src/modules/region/routes.ts

import { Router } from 'express';
import * as regionController from './controller';

const router = Router();

// === Routes công khai (Public) ===
router.get('/', regionController.handleGetAllRegions);
router.post('/', regionController.handleCreateRegion);
router.patch('/:id', regionController.handleUpdateRegion);
router.delete('/:id', regionController.handleDeleteRegion);

export default router;
