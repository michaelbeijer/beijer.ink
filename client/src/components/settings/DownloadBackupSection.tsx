import { useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { downloadBackup } from '../../api/backup';

export function DownloadBackupSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDownload = useCallback(async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await downloadBackup();
      setSuccess('Backup downloaded');
    } catch {
      setError('Failed to download backup');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        ) : (
          <Download className="w-5 h-5 text-slate-400" />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-slate-900 dark:text-white">
            {loading ? 'Preparing backup...' : 'Download Backup'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Export all notes as markdown files in a zip</div>
        </div>
      </button>
      {error && <p className="text-sm text-red-500 dark:text-red-400 px-4 mt-1">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400 px-4 mt-1">{success}</p>}
    </div>
  );
}
