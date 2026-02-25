import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createNoteSchema, updateNoteSchema, moveNoteSchema } from '../validators/note.schema.js';
import * as notesController from '../controllers/notes.controller.js';

const router = Router();

router.get('/notebook/:notebookId', asyncHandler(notesController.getByNotebook));
router.get('/:id', asyncHandler(notesController.getById));
router.post('/', validate(createNoteSchema), asyncHandler(notesController.create));
router.patch('/:id', validate(updateNoteSchema), asyncHandler(notesController.update));
router.delete('/:id', asyncHandler(notesController.remove));
router.patch('/:id/move', validate(moveNoteSchema), asyncHandler(notesController.move));

export default router;
