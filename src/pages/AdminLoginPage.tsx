import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isFirebaseConfigured, auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already admin
  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      if (auth.currentUser) {
        // Just push to dashboard, the AdminRoute will verify UUID
        navigate('/admin/dashboard');
      }
    } else {
      if (sessionStorage.getItem('tropiq-admin') === 'true') {
        navigate('/admin/dashboard');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isFirebaseConfigured() && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/admin/dashboard');
      } catch (err) {
        setError('Invalid admin credentials.');
      }
    } else {
      // Demo Mode
      await new Promise((r) => setTimeout(r, 600));
      if (email === 'admin@tropiq.com' && password === 'admin') {
        sessionStorage.setItem('tropiq-admin', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Use admin@tropiq.com / admin');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link to="/" className="text-text-muted hover:text-white inline-flex items-center gap-2 text-sm uppercase tracking-widest font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Restricted Area</h1>
          <p className="text-text-secondary text-sm">Authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] text-black font-bold rounded-lg px-4 py-3 hover:bg-[#F3E5AB] transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
