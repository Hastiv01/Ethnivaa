import React from 'react';
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

const AppContent: React.FC = () => {
  const { currentPage } = useShop();

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <Welcome />;
      case 'home':
        return <Home />;
      case 'shop':
        return <ProductListing />;
      case 'details':
        return <ProductDetails />;
      case 'cart':
        return <Cart />;
      case 'checkout':
        return <Checkout />;
      case 'success':
        return <OrderSuccess />;
      case 'account':
        return <Account />;
      case 'admin':
        return <AdminDashboard />;
      case 'login':
        return <Auth mode="login" />;
      case 'signup':
        return <Auth mode="signup" />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-ivory-100 font-sans selection:bg-gold-200 selection:text-crimson-950">
      {currentPage !== 'welcome' && <Navbar />}
      <main className="flex-grow">
        {renderPage()}
      </main>
      {currentPage !== 'welcome' && <Footer />}
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
