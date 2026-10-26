import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About Us' },
  { to: '/quote', label: 'Request a Quote' },
];

export default function Navbar() {
  // Bootstrap handles the wide-screen layout; this state opens and closes its mobile menu.
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark site-navbar">
      <div className="container">
        <NavLink className="navbar-brand" to="/" onClick={() => setIsExpanded(false)}>
          {/* The small ATS tile is decorative; the text beside it is the readable brand name. */}
          <span className="brand-mark" aria-hidden="true">ATS</span>
          <span>ATS Roofing Supply</span>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isExpanded}
          aria-label="Toggle navigation"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse${isExpanded ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Keep links in one list so desktop and mobile navigation behave the same way. */}
            {links.map(({ to, label, end }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}${to === '/quote' ? ' navbar-quote-link' : ''}`}
                  to={to}
                  end={end}
                  onClick={() => setIsExpanded(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}