import { useState } from 'react';
import axios from 'axios';

const API = "https://trello-hvze.onrender.com/api";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const res = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'url("https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1920&q=80") center/cover no-repeat fixed',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 16, padding: '40px 36px',
        width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        {/* Logo */}
        <div style={{
          fontSize: 28, fontWeight: 900, fontStyle: 'italic',
          fontFamily: "'Georgia', serif", marginBottom: 8,
          background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Trello
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </h2>
        <p style={{ fontSize: 13, color: '#78716c', marginBottom: 24 }}>
          {isLogin ? 'Login to access your boards' : 'Start organizing your work'}
        </p>

        {/* Fields */}
        {!isLogin && (
          <input
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            style={inputStyle}
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          style={inputStyle}
        />
        <div style={{ position: 'relative', marginBottom: 12 }}>
  <input
    placeholder="Password"
    type={showPassword ? 'text' : 'password'}
    value={form.password}
    onChange={e => setForm({ ...form, password: e.target.value })}
    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
    style={{ ...inputStyle, marginBottom: 0 }}
  />
  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute', right: 10, top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer', fontSize: 16, color: '#78716c',
      userSelect: 'none'
    }}
  >
    {showPassword ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)}
  </span>
</div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee2e2', color: '#b91c1c',
            borderRadius: 8, padding: '8px 12px',
            fontSize: 13, marginBottom: 16
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 9, padding: '12px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', marginBottom: 16,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
        </button>

        {/* Toggle */}
        <p style={{ textAlign: 'center', fontSize: 13, color: '#78716c' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '10px 12px', fontSize: 13, fontFamily: 'inherit',
  marginBottom: 12, outline: 'none', boxSizing: 'border-box',
  color: '#1c1917'
};

export default Auth;