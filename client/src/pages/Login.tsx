import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-brand-500" />
            <span className="text-2xl font-bold">AI Pipes</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-navy-400 mt-1">Log in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-navy-800 border border-navy-700 rounded-xl p-6 space-y-4">
          {error && <div className="text-error-500 text-sm bg-error-500/10 border border-error-500/20 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-navy-100 focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-navy-100 focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="text-center text-navy-400 text-sm mt-4">
          Don't have an account? <Link to="/register" className="text-brand-400 hover:text-brand-300">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
