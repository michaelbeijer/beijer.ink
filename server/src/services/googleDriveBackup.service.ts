import { google } from 'googleapis';
import { config } from '../config.js';
import { createBackupArchive, getBackupFilename } from './backup.service.js';

const DRIVE_UPLOAD_SCOPE = 'https://www.googleapis.com/auth/drive.file';

function hasGoogleDriveConfig(): boolean {
  return Boolean(
    config.googleDriveFolderId &&
    config.googleDriveClientEmail &&
    config.googleDrivePrivateKey,
  );
}

function createDriveClient() {
  const auth = new google.auth.JWT({
    email: config.googleDriveClientEmail,
    key: config.googleDrivePrivateKey,
    scopes: [DRIVE_UPLOAD_SCOPE],
  });

  return {
    auth,
    drive: google.drive({ version: 'v3', auth }),
  };
}

export function canUploadBackupsToGoogleDrive(): boolean {
  return config.backupEnabled && hasGoogleDriveConfig();
}

export async function uploadBackupToGoogleDrive(runDate = new Date()) {
  if (!hasGoogleDriveConfig()) {
    throw new Error('Google Drive backup is not fully configured.');
  }

  const archive = await createBackupArchive();
  const fileName = getBackupFilename(runDate);
  const { auth, drive } = createDriveClient();

  await auth.authorize();

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [config.googleDriveFolderId],
    },
    media: {
      mimeType: 'application/zip',
      body: archive,
    },
    fields: 'id,name,webViewLink',
  });

  return response.data;
}
