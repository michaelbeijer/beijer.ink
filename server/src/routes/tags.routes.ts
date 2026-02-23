import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createTagSchema, updateTagSchema } from '../validators/tag.schema.js';
import * as tagsController from '../controllers/tags.controller.js';

const router = Router();

router.get('/', tagsController.getAll);
router.post('/', validate(createTagSchema), tagsController.create);
router.patch('/:id', validate(updateTagSchema), tagsController.update);
router.delete('/:id', tagsController.remove);

export default router;
