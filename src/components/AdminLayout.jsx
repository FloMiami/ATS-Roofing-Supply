import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

// Give every admin page the same header and sign-out button.
export default function AdminLayout() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const navigate = useNavigate();

  // Sign out through Supabase, and only leave the admin area when that succeeds.
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

  // The admin pages share this header; Outlet is where the selected page appears.
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