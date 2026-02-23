import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createTagSchema, updateTagSchema } from '../validators/tag.schema.js';
import * as tagsController from '../controllers/tags.controller.js';

const router = Router();

router.get('/', asyncHandler(tagsController.getAll));
router.post('/', validate(createTagSchema), asyncHandler(tagsController.create));
router.patch('/:id', validate(updateTagSchema), asyncHandler(tagsController.update));
router.delete('/:id', asyncHandler(tagsController.remove));

export default router;
