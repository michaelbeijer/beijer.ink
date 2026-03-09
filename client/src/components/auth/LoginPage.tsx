import { useState, type FormEvent } from 'react';
import { PenLine, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(password);
    } catch {
      setError('Invalid password');
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
          <h1 className="text-2xl font-bold text-ink">Beijer.ink</h1>
          <p className="text-ink-muted mt-1">Personal notes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-input-bg border border-edge rounded-lg text-ink placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center">
          <a
            href="https://github.com/michaelbeijer/beijer.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink-secondary transition-colors"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
