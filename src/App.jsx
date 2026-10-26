import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminGate from './components/AdminGate.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import SiteLayout from './components/SiteLayout.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminQuoteDetailPage from './pages/AdminQuoteDetailPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import QuotePage from './pages/QuotePage.jsx';

export default function App() {
  // The public site and admin area use separate layouts so their navigation stays independent.
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Routes>
        {/* Login stays outside the protected routes so signed-out staff can reach it. */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        {/* Check admin access once, then show the shared admin header around its pages. */}
        <Route path="/admin" element={<AdminGate />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="quotes/:id" element={<AdminQuoteDetailPage />} />
          </Route>
        </Route>
        {/* Every customer-facing page shares the same site navigation and footer. */}
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="quote" element={<QuotePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}