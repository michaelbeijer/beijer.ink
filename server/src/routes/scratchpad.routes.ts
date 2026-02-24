import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { updateScratchpadSchema } from '../validators/scratchpad.schema.js';
import * as scratchpadController from '../controllers/scratchpad.controller.js';

const router = Router();

router.get('/', asyncHandler(scratchpadController.get));
router.put('/', validate(updateScratchpadSchema), asyncHandler(scratchpadController.update));

export default router;
