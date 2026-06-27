import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ServerWakeUpOverlay } from './components/ServerWakeUpOverlay';

// Pages - dynamic lazy loads
const Welcome = lazy(() => import('./pages/Welcome').then(m => ({ default: m.Welcome })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ProductListing = lazy(() => import('./pages/ProductListing').then(m => ({ default: m.ProductListing })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed').then(m => ({ default: m.PaymentFailed })));
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Terms = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const Returns = lazy(() => import('./pages/Returns').then(m => ({ default: m.Returns })));

// ProtectedRoute: redirects to /login if user is not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useShop();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// AdminRoute: redirects to /login if user is not an admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentUserRole } = useShop();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUserRole !== 'ADMIN') return <Navigate to="/home" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isWelcome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-ivory-100 font-sans selection:bg-gold-200 selection:text-crimson-950">
      {!isWelcome && <Navbar />}
      <ServerWakeUpOverlay />
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes — accessible without login */}
            <Route path="/" element={<Welcome />} />
            <Route path="/home" element={<Home />} />
            <Route path="/shop" element={<ProductListing />} />
            <Route path="/details/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/returns" element={<Returns />} />

            {/* All other routes require login */}
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="/failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            {/* Admin page — requires ADMIN role */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Catch-all — redirect to login if not authenticated */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isWelcome && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}

export default App;
