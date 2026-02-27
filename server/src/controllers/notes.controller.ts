import { Request, Response } from 'express';
import * as notesService from '../services/notes.service.js';

export async function getByNotebook(req: Request, res: Response) {
  const notes = await notesService.getNotesInNotebook(req.params.notebookId);
  res.json(notes);
}

export async function getRoot(req: Request, res: Response) {
  const notes = await notesService.getRootNotes();
  res.json(notes);
}

export async function getById(req: Request, res: Response) {
  const note = await notesService.getNoteById(req.params.id);
  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  res.json(note);
}

export async function create(req: Request, res: Response) {
  const note = await notesService.createNote(req.body);
  res.status(201).json(note);
}

export async function update(req: Request, res: Response) {
  const note = await notesService.updateNote(req.params.id, req.body);
  res.json(note);
}

export async function remove(req: Request, res: Response) {
  await notesService.deleteNote(req.params.id);
  res.json({ success: true });
}

export async function move(req: Request, res: Response) {
  const note = await notesService.moveNote(req.params.id, req.body.notebookId);
  res.json(note);
}
