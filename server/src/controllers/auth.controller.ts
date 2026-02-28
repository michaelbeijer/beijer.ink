import { Request, Response } from 'express';
import { verifyPassword, changePassword as changePasswordService } from '../services/auth.service.js';

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

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const success = await changePasswordService(currentPassword, newPassword);

  if (!success) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  res.json({ success: true });
}
