import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function AdminGate() {
  const [access, setAccess] = useState('checking');
  const location = useLocation();

  useEffect(() => {
    let isCurrent = true;

    async function verifySession(session) {
      if (!session) {
        if (isCurrent) setAccess('unauthenticated');
        return;
      }

      if (isCurrent) setAccess('checking');
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (isCurrent) setAccess(error ? 'error' : data ? 'authorized' : 'unauthorized');
      } catch {
        if (isCurrent) setAccess('error');
      }
    }

    if (!supabase) {
      setAccess('error');
      return undefined;
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (isCurrent) setAccess('error');
      } else {
        void verifySession(data.session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void verifySession(session);
    });

    return () => {
      isCurrent = false;
      subscription.unsubscribe();
    };
  }, []);

  if (access === 'checking') {
    return <main className="container py-5"><p role="status">Checking admin access…</p></main>;
  }

  if (access === 'unauthenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (access === 'unauthorized') {
    return (
      <main className="container py-5 admin-narrow">
        <div className="alert alert-warning" role="alert">
          This Supabase account is not approved for admin access. Ask an administrator to add it to the admin allowlist.
        </div>
      </main>
    );
  }

  if (access === 'error') {
    return (
      <main className="container py-5 admin-narrow">
        <div className="alert alert-danger" role="alert">
          Admin access could not be verified. Check the Supabase configuration and apply the admin access migration.
        </div>
      </main>
    );
  }

  return <Outlet />;
}