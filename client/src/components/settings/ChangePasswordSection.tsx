import { useState, useCallback, FormEvent } from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { changePassword } from '../../api/auth';

export function ChangePasswordSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const inputClass = 'w-full px-3 py-2 bg-input-bg border border-edge rounded-lg text-sm text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent';

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-hover transition-colors text-left"
      >
        <Lock className="w-5 h-5 text-ink-faint" />
        <div className="flex-1">
          <div className="text-sm font-medium text-ink">Change Password</div>
          <div className="text-xs text-ink-muted">Update your account password</div>
        </div>
        <ChevronRight className={`w-4 h-4 text-ink-faint transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-2 ml-8 mr-4 space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
          {success && (
            <p className="text-sm text-success">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}
