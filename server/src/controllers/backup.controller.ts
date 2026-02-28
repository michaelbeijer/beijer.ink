import { Request, Response } from 'express';
import * as backupService from '../services/backup.service.js';

export async function downloadBackup(_req: Request, res: Response) {
  const date = new Date().toISOString().slice(0, 10);
  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="beijer-ink-backup-${date}.zip"`,
  });

  const archive = await backupService.createBackupArchive();
  archive.pipe(res);
}
