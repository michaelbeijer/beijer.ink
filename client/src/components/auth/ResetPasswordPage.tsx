import { useState, useEffect, type FormEvent } from 'react';
import { PenLine } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch {
      setError('Reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <PenLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">New Password</h1>
          <p className="text-ink-muted mt-1">Enter your new password</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-success text-sm">
              Password reset successfully! Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="w-full px-4 py-3 bg-input-bg border border-edge rounded-lg text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-input-bg border border-edge rounded-lg text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-accent hover:underline"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
