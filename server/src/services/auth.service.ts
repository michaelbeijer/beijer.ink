import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { sendPasswordResetEmail } from './email.service.js';

export async function verifyPassword(password: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: 'admin' } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
    expiresIn: '30d',
  });

  return token;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: 'admin' } });
  if (!user) return false;

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return false;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: 'admin' }, data: { passwordHash } });
  return true;
}

export async function requestPasswordReset(): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: 'admin' },
    data: { resetToken: token, resetExpires: expires },
  });

  const resetUrl = `${config.appUrl}/reset-password/${token}`;
  await sendPasswordResetEmail(resetUrl);
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: 'admin' } });
  if (!user || !user.resetToken || !user.resetExpires) return false;
  if (user.resetToken !== token) return false;
  if (user.resetExpires < new Date()) return false;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: 'admin' },
    data: { passwordHash, resetToken: null, resetExpires: null },
  });
  return true;
}
