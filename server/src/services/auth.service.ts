import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';

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
