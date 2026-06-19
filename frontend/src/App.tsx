import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { ProductListing } from './pages/ProductListing';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { Account } from './pages/Account';
import { AdminDashboard } from './pages/AdminDashboard';
import { Welcome } from './pages/Welcome';
import { Auth } from './pages/Auth';

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
      <main className="flex-grow">
        <Routes>
          {/* Public routes — accessible without login */}
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<ProductListing />} />
          <Route path="/details/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />

          {/* All other routes require login */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

          {/* Admin page — requires ADMIN role */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Catch-all — redirect to login if not authenticated */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
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
