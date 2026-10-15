import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function AdminLayout() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const navigate = useNavigate();

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError('');
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError('Could not sign out. Please try again.');
      setIsSigningOut(false);
      return;
    }
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="container d-flex align-items-center justify-content-between gap-3">
          <Link className="admin-brand" to="/admin">ATS <span>Roofing Supply</span></Link>
          <button className="btn btn-outline-light btn-sm" type="button" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>
      <main className="container admin-main py-4 py-lg-5">
        {signOutError && <div className="alert alert-danger" role="alert">{signOutError}</div>}
        <Outlet />
      </main>
    </div>
  );
}