import { Request, Response } from 'express';
import * as tagsService from '../services/tags.service.js';

export async function getAll(_req: Request, res: Response) {
  const tags = await tagsService.getAllTags();
  res.json(tags);
}

export async function create(req: Request, res: Response) {
  const tag = await tagsService.createTag(req.body);
  res.status(201).json(tag);
}

export async function update(req: Request, res: Response) {
  const tag = await tagsService.updateTag(req.params.id, req.body);
  res.json(tag);
}

export async function remove(req: Request, res: Response) {
  await tagsService.deleteTag(req.params.id);
  res.json({ success: true });
}
