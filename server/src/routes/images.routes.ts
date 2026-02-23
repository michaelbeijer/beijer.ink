import { Router } from 'express';
import multer from 'multer';
import * as imagesController from '../controllers/images.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

router.post('/upload', upload.single('file'), imagesController.upload);
router.delete('/:id', imagesController.remove);

export default router;
