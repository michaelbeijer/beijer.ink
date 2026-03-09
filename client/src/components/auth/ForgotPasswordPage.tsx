import { useState, type FormEvent } from 'react';
import { PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../api/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
          <h1 className="text-2xl font-bold text-ink">Reset Password</h1>
          <p className="text-ink-muted mt-1">
            Enter your email to receive a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-success text-sm">
              If this email is registered, a reset link has been sent. Check your inbox.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm text-accent hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 bg-input-bg border border-edge rounded-lg text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
