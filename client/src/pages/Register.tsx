import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { Sparkles } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-navy-400 mt-1">Start building AI pipelines for free</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-navy-800 border border-navy-700 rounded-xl p-6 space-y-4">
          {error && <div className="text-error-500 text-sm bg-error-500/10 border border-error-500/20 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-navy-100 focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-navy-100 focus:outline-none focus:border-brand-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-navy-100 focus:outline-none focus:border-brand-500 transition-colors" />
            <p className="text-xs text-navy-500 mt-1">At least 8 characters</p>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-navy-400 text-sm mt-4">
          Already have an account? <Link to="/login" className="text-brand-400 hover:text-brand-300">Log in</Link>
        </p>
      </div>
    </div>
  );
}
