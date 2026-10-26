import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

// Sign staff in and only continue if the database says their account is approved.
export default function AdminLoginPage() {
  // The form keeps these values here until Supabase checks the sign-in.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sign in first, then check the admin allowlist before opening the dashboard.
  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    if (!supabase) {
      setErrorMessage('Admin sign-in is unavailable until Supabase is configured.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setErrorMessage('Sign-in failed. Check your email and password and try again.');
        return;
      }

      const { data, error: accessError } = await supabase.rpc('is_admin');
      if (accessError || !data) {
        await supabase.auth.signOut();
        setErrorMessage('This account is not approved for admin access. Contact your administrator.');
        return;
      }

      navigate(location.state?.from || '/admin', { replace: true });
    } catch {
      setErrorMessage('Sign-in is temporarily unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Keep staff login separate from the public site navigation.
  return (
    <main className="admin-login-page">
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <Link className="admin-brand admin-login-brand" to="/">ATS <span>Roofing Supply</span></Link>
        <p className="admin-eyebrow mt-5 mb-2">STAFF ACCESS</p>
        <h1 id="admin-login-title" className="h3 mb-2">Admin sign in</h1>
        <p className="text-muted mb-4">Use your approved staff account to manage quote requests.</p>
        <form onSubmit={handleSubmit}>
          {/* Use the browser's password manager hints to make staff sign-in easier. */}
          <div className="mb-3">
            <label className="form-label" htmlFor="admin-email">Email</label>
            <input
              className="form-control"
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              className="form-control"
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
          <button className="btn btn-accent w-100" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <Link className="d-inline-block mt-4 small" to="/">Back to ATS Roofing Supply</Link>
      </section>
    </main>
  );
}