import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createNotebookSchema, updateNotebookSchema } from '../validators/notebook.schema.js';
import * as notebooksController from '../controllers/notebooks.controller.js';

const router = Router();

router.get('/', asyncHandler(notebooksController.getAll));
router.post('/', validate(createNotebookSchema), asyncHandler(notebooksController.create));
router.patch('/:id', validate(updateNotebookSchema), asyncHandler(notebooksController.update));
router.delete('/:id', asyncHandler(notebooksController.remove));

export default router;
