# Claude Notes

## Backup Status

- Daily backup support now uses the same ZIP export path as the manual backup download.
- Google Drive backup support was implemented first, but it was blocked by Google service-account storage limits when targeting a normal `My Drive` folder.
- The project has since been switched to SFTP-based backups.

## Google Drive Findings

- Google Drive API was enabled successfully for project `beijerink` / project number `819490443768`.
- Authentication to Google worked after setup.
- Uploads still failed with: `Service Accounts do not have storage quota`.
- Conclusion: this approach would require either a real Google Shared Drive or a user OAuth flow instead of the current service-account upload to `My Drive`.

## Current SFTP Plan

- Hosting provider: Namecheap business hosting.
- Confirmed working SFTP host: `185.61.152.57`
- Confirmed working SFTP port: `21098`
- Confirmed working SFTP username: `wbymlrtq`
- Backup folder created on server: `/home/wbymlrtq/Beijer.ink_backups`
- The app is configured to upload the generated ZIP backup archive to that folder.

## Current App State

- Manual settings action exists in the UI: `Run SFTP Backup Now`
- Daily scheduler is enabled through environment variables and logs startup correctly.
- The codebase now includes keyboard-interactive SFTP auth handling because the host appears to require it.
- Latest related fixes were pushed to GitHub during this setup session.

## Remaining Issue

- Railway deployments now build and run successfully.
- Manual backup attempts are still failing with `All configured authentication methods failed`.
- Most likely next step: reset the SFTP password to a fresh temporary value, verify it in WinSCP, then update the same exact password in Railway and retry.

## Railway Environment Variables

Expected variables:

```env
BACKUP_ENABLED=true
BACKUP_CRON=0 2 * * *
BACKUP_TIMEZONE=Europe/London
BACKUP_SFTP_HOST=185.61.152.57
BACKUP_SFTP_PORT=21098
BACKUP_SFTP_USERNAME=wbymlrtq
BACKUP_SFTP_PASSWORD=<set in Railway only>
BACKUP_SFTP_REMOTE_DIR=/home/wbymlrtq/Beijer.ink_backups
```

## Alternative Backup Option

- Emailing the ZIP backup is also feasible and may be simpler than SFTP.
- This would reuse the same archive generation flow and send the ZIP as an attachment.
- Main constraint: email attachment size limits, so this works best while the backup ZIP stays comfortably under Gmail's attachment cap.

