import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function SiteLayout() {
  // Keep the footer at the bottom on short pages and reuse the navbar on every public route.
  return (
    <div className="site-shell">
      <Navbar />
      <main>
        {/* React Router renders the current public page here. */}
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p><strong>ATS Roofing Supply</strong> &mdash; Materials made for the long haul.</p>
          <p>&copy; {new Date().getFullYear()} ATS Roofing Supply. Built for every season.</p>
        </div>
      </footer>
    </div>
  );
}