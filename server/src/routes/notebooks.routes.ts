import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createNotebookSchema, updateNotebookSchema } from '../validators/notebook.schema.js';
import * as notebooksController from '../controllers/notebooks.controller.js';

const router = Router();

router.get('/', notebooksController.getAll);
router.post('/', validate(createNotebookSchema), notebooksController.create);
router.patch('/:id', validate(updateNotebookSchema), notebooksController.update);
router.delete('/:id', notebooksController.remove);

export default router;
