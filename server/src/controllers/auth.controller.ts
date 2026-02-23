import { Request, Response } from 'express';
import { verifyPassword } from '../services/auth.service.js';

export async function login(req: Request, res: Response) {
  const { password } = req.body;
  const token = await verifyPassword(password);

  if (!token) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  res.json({ token });
}

export async function verify(_req: Request, res: Response) {
  res.json({ valid: true });
}
