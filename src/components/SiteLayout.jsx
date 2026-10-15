import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function SiteLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}