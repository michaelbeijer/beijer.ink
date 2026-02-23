import { Request, Response } from 'express';
import * as notebooksService from '../services/notebooks.service.js';

export async function getAll(_req: Request, res: Response) {
  const notebooks = await notebooksService.getAllNotebooks();
  res.json(notebooks);
}

export async function create(req: Request, res: Response) {
  const notebook = await notebooksService.createNotebook(req.body);
  res.status(201).json(notebook);
}

export async function update(req: Request, res: Response) {
  const notebook = await notebooksService.updateNotebook(req.params.id, req.body);
  res.json(notebook);
}

export async function remove(req: Request, res: Response) {
  await notebooksService.deleteNotebook(req.params.id);
  res.json({ success: true });
}
