import { Request, Response } from 'express';
import * as imagesService from '../services/images.service.js';

export async function upload(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  const image = await imagesService.uploadImage(req.file);
  res.status(201).json(image);
}

export async function remove(req: Request, res: Response) {
  await imagesService.deleteImage(req.params.id);
  res.json({ success: true });
}
