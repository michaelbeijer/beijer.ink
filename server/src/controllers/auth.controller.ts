import { Request, Response } from 'express';
import {
  verifyPassword,
  changePassword as changePasswordService,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from '../services/auth.service.js';
import { config } from '../config.js';

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

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  // Always return success to avoid leaking whether the email is registered
  if (config.adminEmail && email.toLowerCase() === config.adminEmail.toLowerCase()) {
    await requestPasswordReset();
  }

  res.json({ success: true });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  const success = await resetPasswordService(token, newPassword);

  if (!success) {
    res.status(400).json({ error: 'Reset link is invalid or has expired' });
    return;
  }

  res.json({ success: true });
}
