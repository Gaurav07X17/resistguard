import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'technician', institution: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🛡️</div>
          <h1>ResistGuard</h1>
          <p>Create your account</p>
        </div>

        <div className="auth-divider" />

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Register</h2>

          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-control"
              name="name"
              placeholder="Dr. Jane Smith"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              className="form-control"
              type="email"
              name="email"
              placeholder="you@hospital.org"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="form-control"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" className="form-control" name="role" value={form.role} onChange={handleChange}>
              <option value="technician">Lab Technician — Data Entry</option>
              <option value="researcher">Researcher — Analytics Access</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="institution">Institution <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
            <input
              id="institution"
              className="form-control"
              name="institution"
              placeholder="e.g. AIIMS Delhi"
              value={form.institution}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
