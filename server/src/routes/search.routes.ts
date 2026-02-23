import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as searchController from '../controllers/search.controller.js';

const router = Router();

router.get('/', asyncHandler(searchController.search));

export default router;
