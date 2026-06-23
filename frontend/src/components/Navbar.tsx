import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Search, Heart, ShoppingBag, User, ShieldAlert, Sparkles, Menu, X, ArrowRight, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { 
    navigateTo, 
    cartCount, 
    wishlist, 
    searchQuery, 
    setSearchQuery,
    setActiveAccountTab,
    currentUser,
    currentUserRole,
    profile,
    logout
  } = useShop();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== '/shop') {
      navigateTo('shop');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('shop');
    setIsSearchExpanded(false);
  };

  const menuItems = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop All', page: 'shop' as const },
    { label: 'My Account', page: 'account' as const },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 glass-premium shadow-gold-sm">
      {/* Decorative top festive strip */}
      <div className="w-full h-1 bg-gradient-to-r from-crimson-950 via-gold-400 to-crimson-950"></div>
      
      {/* Announcement Bar */}
      <div className="bg-crimson-950 text-gold-100 text-xs py-1.5 px-4 text-center font-sans tracking-widest flex items-center justify-center gap-2">
        <Sparkles size={12} className="animate-pulse text-gold-300" />
        <span>FESTIVE SALE: GET 10% OFF ON KUNDAN COLLECTION • FREE SHIPPING ABOVE ₹5,000</span>
        <Sparkles size={12} className="animate-pulse text-gold-300" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Icon */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-crimson-950 hover:text-gold-600 p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Nav Items - Desktop Left */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  if (item.page === 'account') {
                    setActiveAccountTab('orders');
                  }
                  navigateTo(item.page);
                }}
                className={`font-sans text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${
                  location.pathname === `/${item.page}`
                    ? 'text-crimson-800 border-b-2 border-gold-400 pb-1' 
                    : 'text-obsidian-800 hover:text-gold-600 pb-1'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Brand Logo Centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex justify-center">
            <button 
              onClick={() => navigateTo('home')} 
              className="flex flex-col items-center group cursor-pointer focus:outline-none"
            >
              <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-widest text-crimson-950 group-hover:text-gold-600 transition-colors duration-300">
                ETHNIVAA
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.4em] text-gold-600 font-sans mt-0.5 font-bold">
                THE HERITAGE OF JEWELRY
              </span>
            </button>
          </div>

          {/* Action Icons - Right */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Search Input Expanded */}
            <form 
              onSubmit={handleSearchSubmit} 
              className={`relative items-center transition-all duration-300 hidden md:flex ${
                isSearchExpanded ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
              }`}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search collection..."
                className="w-full bg-ivory-200 border border-gold-300 text-obsidian-950 text-xs rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:border-gold-500 font-sans shadow-gold-sm"
              />
              <button type="submit" className="absolute right-3 text-crimson-950 hover:text-gold-600">
                <Search size={14} />
              </button>
            </form>

            {/* Search Toggle Icon */}
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="hidden md:block text-crimson-950 hover:text-gold-600 p-2 rounded-full hover:bg-ivory-200 transition-all duration-200"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Icon */}
            <button 
              onClick={() => {
                setActiveAccountTab('wishlist');
                navigateTo('account');
              }}
              className="text-crimson-950 hover:text-gold-600 p-2 rounded-full hover:bg-ivory-200 transition-all duration-200 relative"
              title="Wishlist"
            >
              <Heart size={20} className={wishlist.length > 0 ? "fill-crimson-600 text-crimson-600" : ""} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-crimson-600 text-gold-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button 
              onClick={() => navigateTo('cart')} 
              className="text-crimson-950 hover:text-gold-600 p-2 rounded-full hover:bg-ivory-200 transition-all duration-200 relative"
              title="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-400 text-crimson-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Logout */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-1">
                <button 
                  onClick={() => {
                    setActiveAccountTab('orders');
                    navigateTo('account');
                  }}
                  className="text-crimson-950 hover:text-gold-600 p-2 rounded-full hover:bg-ivory-200 transition-all duration-200 flex items-center gap-1.5"
                  title="My Profile"
                >
                  <User size={20} />
                  <span className="hidden lg:inline text-xs font-semibold uppercase tracking-wider text-crimson-950 truncate max-w-[80px]">
                    {profile.name.split(' ')[0]}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="text-crimson-950 hover:text-crimson-600 p-2 rounded-full hover:bg-ivory-200 transition-all duration-200"
                  title="Log Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigateTo('login')}
                className="hidden md:flex text-crimson-950 hover:text-gold-600 p-2 rounded-full hover:bg-ivory-200 transition-all duration-200 flex items-center gap-1"
                title="Log In"
              >
                <User size={20} />
                <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Log In</span>
              </button>
            )}

            {/* Elegant Admin Switch */}
            {currentUserRole === 'ADMIN' && (
              <button
                onClick={() => navigateTo('admin')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-crimson-950 text-gold-400 border border-gold-400 transition-all duration-300 hover:bg-crimson-900"
                title="Go to Admin Panel"
              >
                <ShieldAlert size={14} />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div className="md:hidden px-4 pb-3 flex items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search matching jewelry..."
            className="w-full bg-ivory-200 border border-gold-300 text-obsidian-950 text-xs rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-gold-500 font-sans"
          />
          <button type="submit" className="absolute right-3 top-2 text-crimson-950 hover:text-gold-600">
            <Search size={16} />
          </button>
        </form>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-ivory-100 border-t border-gold-200 py-4 px-6 animate-fadeIn">
          <div className="flex flex-col space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  if (item.page === 'account') {
                    setActiveAccountTab('orders');
                  }
                  navigateTo(item.page);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left font-sans text-sm font-semibold tracking-wider uppercase transition-colors duration-200 py-1 ${
                  location.pathname === `/${item.page}` ? 'text-crimson-800 pl-2 border-l-2 border-gold-400' : 'text-obsidian-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {currentUser ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full border-t border-gold-200 pt-3 text-left font-sans text-sm font-semibold tracking-wider uppercase text-crimson-800"
              >
                <span className="flex items-center gap-2">
                  <LogOut size={16} />
                  <span>Log Out ({profile.name.split(' ')[0]})</span>
                </span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => {
                  navigateTo('login');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full border-t border-gold-200 pt-3 text-left font-sans text-sm font-semibold tracking-wider uppercase text-crimson-800"
              >
                <span className="flex items-center gap-2">
                  <User size={16} />
                  <span>Log In / Sign Up</span>
                </span>
                <ArrowRight size={16} />
              </button>
            )}

            {currentUserRole === 'ADMIN' && (
              <button
                onClick={() => {
                  navigateTo('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full border-t border-gold-200 pt-3 text-left font-sans text-sm font-semibold tracking-wider uppercase text-crimson-800"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>Admin Panel</span>
                </span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
