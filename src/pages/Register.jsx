import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Gamepad2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rateLimitError, setRateLimitError] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Password must be 6+ characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.username);
      toast.success('Account created! Redirecting to login...');
      navigate('/login');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('email rate')) {
        setRateLimitError(true);
      } else {
        toast.error(msg || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div className="navbar-logo-icon" style={{ width: 52, height: 52 }}>
            <Gamepad2 size={26} />
          </div>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join MDM Gaming — level up your setup today</p>

        {rateLimitError && (
          <div style={{
            background: 'rgba(255,71,87,0.08)',
            border: '1px solid rgba(255,71,87,0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            lineHeight: 1.6,
          }}>
            <p style={{ fontWeight: 700, color: 'var(--accent-red)', marginBottom: 8 }}>⚠️ Email Rate Limit Reached</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              Supabase free tier limits signup emails. Fix it in 30 seconds:
            </p>
            <ol style={{ color: 'var(--text-secondary)', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Go to your <strong style={{ color: 'var(--text-primary)' }}>Supabase Dashboard</strong></li>
              <li>Click <strong style={{ color: 'var(--text-primary)' }}>Authentication → Providers → Email</strong></li>
              <li>Turn <strong style={{ color: 'var(--accent-green)' }}>OFF</strong> → <em>"Confirm email"</em></li>
              <li>Click <strong style={{ color: 'var(--text-primary)' }}>Save</strong>, then try again</li>
            </ol>
            <button
              onClick={() => setRateLimitError(false)}
              style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-username"
                type="text"
                className={`form-input ${errors.username ? 'error' : ''}`}
                style={{ paddingLeft: 44 }}
                placeholder="GamingHero123"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>
            {errors.username && <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem' }}>{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: 44 }}
                placeholder="gamer@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {errors.email && <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: 44, paddingRight: 44 }}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem' }}>{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="register-confirm"
                type="password"
                className={`form-input ${errors.confirm ? 'error' : ''}`}
                style={{ paddingLeft: 44 }}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
            {errors.confirm && <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem' }}>{errors.confirm}</span>}
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
