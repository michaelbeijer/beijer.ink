import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import * as scratchpadService from '../services/scratchpad.service.js';

export async function get(req: AuthRequest, res: Response) {
  const pad = await scratchpadService.getScratchpad(req.userId!);
  res.json(pad);
}

export async function update(req: AuthRequest, res: Response) {
  await scratchpadService.updateScratchpad(req.userId!, req.body.content);
  res.json({ success: true });
}
