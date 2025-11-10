// src/modules/region/routes.ts

import { Router } from 'express';
import * as regionController from './controller';
import { auth, optionalAuth, isAdmin } from "../../middleware/auth";

const router = Router();

// Public routes
router.get('/', regionController.handleGetAllRegions);

// Private routes
router.post('/', auth, regionController.handleCreateRegion);
router.patch('/:id', auth, regionController.handleUpdateRegion);
router.delete('/:id', auth, regionController.handleDeleteRegion);

export default router;
