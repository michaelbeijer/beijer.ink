import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createNoteSchema, updateNoteSchema, moveNoteSchema, setNoteTagsSchema } from '../validators/note.schema.js';
import * as notesController from '../controllers/notes.controller.js';

const router = Router();

router.get('/notebook/:notebookId', notesController.getByNotebook);
router.get('/:id', notesController.getById);
router.post('/', validate(createNoteSchema), notesController.create);
router.patch('/:id', validate(updateNoteSchema), notesController.update);
router.delete('/:id', notesController.remove);
router.patch('/:id/move', validate(moveNoteSchema), notesController.move);
router.put('/:id/tags', validate(setNoteTagsSchema), notesController.setTags);

export default router;
