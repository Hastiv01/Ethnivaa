import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import type { ShippingAddress } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { User, Package, Heart, MapPin, ChevronDown, ChevronUp, Download, Plus, X } from 'lucide-react';
import { INDIAN_STATES } from './Checkout';

export const Account: React.FC = () => {
  const { 
    profile, 
    orders, 
    wishlist, 
    products, 
    saveProfileAddress,
    navigateTo,
    activeAccountTab: activeTab,
    setActiveAccountTab: setActiveTab,
    addresses,
    addAddress,
    currentUser,
  } = useShop();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Add Address Modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    fullName: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.mobileNumber || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      return;
    }
    // Save to backend
    await addAddress({
      label: 'Shipping Address',
      recipientName: newAddress.fullName,
      phone: newAddress.mobileNumber,
      line1: newAddress.address,
      city: newAddress.city,
      state: newAddress.state,
      postalCode: newAddress.pincode,
      country: 'India',
      isDefault: addresses.length === 0,
    });
    // Also keep local profile in sync for Checkout autofill
    saveProfileAddress(newAddress);
    setNewAddress({
      fullName: '',
      mobileNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setShowAddAddress(false);
  };

  const handleInvoiceDownload = (orderId: string) => {
    alert(`Downloading Invoice for Order ${orderId}...`);
  };

  // Resolve products in wishlist
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn min-h-screen">
      {/* Title */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-serif text-3xl font-extrabold text-crimson-950 uppercase tracking-wide">
          My Account
        </h1>
        <p className="text-xs text-obsidian-600 font-sans font-light">
          Manage your profile, order logs, and matching jewelry wishlist
        </p>
        <div className="w-16 h-0.5 bg-gold-400 mx-auto mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Sidebar Navigation tabs */}
        <aside className="bg-white border border-gold-200/50 rounded-2xl p-5 shadow-gold shadow-sm font-sans text-xs">
          
          {/* User mini profile card */}
          <div className="flex items-center gap-3 pb-5 border-b border-gold-100 mb-4">
            <div className="w-12 h-12 rounded-full bg-crimson-950 text-gold-100 flex items-center justify-center text-lg font-bold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-crimson-950">{profile.name}</h3>
              <p className="text-[10px] text-obsidian-400 font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1 font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'orders' 
                  ? 'bg-crimson-950 text-gold-100 shadow-md' 
                  : 'text-obsidian-750 hover:bg-gold-50/50 hover:text-crimson-950'
              }`}
            >
              <Package size={16} />
              <span>Order History ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'wishlist' 
                  ? 'bg-crimson-950 text-gold-100 shadow-md' 
                  : 'text-obsidian-750 hover:bg-gold-50/50 hover:text-crimson-950'
              }`}
            >
              <Heart size={16} />
              <span>My Wishlist ({wishlistedProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'addresses' 
                  ? 'bg-crimson-950 text-gold-100 shadow-md' 
                  : 'text-obsidian-750 hover:bg-gold-50/50 hover:text-crimson-950'
              }`}
            >
              <MapPin size={16} />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile' 
                  ? 'bg-crimson-950 text-gold-100 shadow-md' 
                  : 'text-obsidian-750 hover:bg-gold-50/50 hover:text-crimson-950'
              }`}
            >
              <User size={16} />
              <span>Profile Details</span>
            </button>
          </div>
        </aside>

        {/* Right Column: Tab View Contents */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB: Orders History */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">Purchase Logs</h2>
              
              {orders.length === 0 ? (
                <div className="bg-white border border-gold-200/50 rounded-2xl p-10 text-center space-y-4 shadow-sm text-xs font-sans">
                  <Package size={32} className="text-gold-500 mx-auto" />
                  <p className="text-obsidian-500 font-light">You haven't placed any orders yet.</p>
                  <button onClick={() => navigateTo('shop')} className="bg-crimson-950 text-gold-100 font-bold uppercase tracking-wider px-6 py-2.5 rounded-full">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3 font-sans text-xs">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-white border border-gold-200/50 rounded-2xl overflow-hidden shadow-gold shadow-sm"
                    >
                      {/* Accordion Header */}
                      <div 
                        onClick={() => toggleOrderExpand(order.id)}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer hover:bg-gold-50/10 transition-colors"
                      >
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8">
                          <div>
                            <span className="text-obsidian-400 text-[10px] uppercase tracking-wider block">Order ID</span>
                            <span className="font-bold text-crimson-950 font-mono">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-obsidian-400 text-[10px] uppercase tracking-wider block">Placed On</span>
                            <span className="font-semibold text-obsidian-900">{order.date}</span>
                          </div>
                          <div>
                            <span className="text-obsidian-400 text-[10px] uppercase tracking-wider block">Total Amount</span>
                            <span className="font-bold text-obsidian-900">₹{order.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0">
                          <span className={`font-bold border px-3 py-1 rounded-full uppercase tracking-wider text-[9px] ${
                            order.paymentStatus === 'Success'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                          <span className={`font-bold border px-3 py-1 rounded-full uppercase tracking-wider text-[9px] ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.status === 'Shipped'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : order.status === 'Cancelled'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            Shipping: {order.status}
                          </span>
                          {expandedOrderId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Accordion Expand Body */}
                      {expandedOrderId === order.id && (
                        <div className="border-t border-gold-100 p-5 bg-ivory-50/30 space-y-6 animate-fadeIn">
                          
                          {/* Order Products */}
                          <div className="space-y-3">
                            <h4 className="font-serif font-bold text-crimson-950 text-sm">Ordered Items</h4>
                            <div className="divide-y divide-gold-100">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2.5">
                                  <div className="flex items-center gap-3">
                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gold-100" />
                                    <div>
                                      <span className="font-semibold text-obsidian-950 block">{item.name}</span>
                                      <span className="text-obsidian-400 text-[10px]">Price: ₹{item.price.toLocaleString('en-IN')} • Qty: {item.quantity}</span>
                                    </div>
                                  </div>
                                  <span className="font-bold text-obsidian-950">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Address & Actions */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gold-100">
                            <div>
                              <h4 className="font-serif font-bold text-crimson-950 text-sm mb-2">Delivery Address</h4>
                              <p className="font-light text-obsidian-700 leading-relaxed text-[11px]">
                                <span className="font-semibold text-obsidian-900 block">{order.shippingAddress.fullName}</span>
                                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                              </p>
                            </div>
                            
                            <div className="flex flex-col justify-end items-stretch sm:items-end gap-2.5">
                              <button
                                onClick={() => handleInvoiceDownload(order.id)}
                                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-gold-300 bg-white hover:bg-gold-50 text-crimson-950 font-bold uppercase transition-colors"
                              >
                                <Download size={12} />
                                <span>Download Invoice</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-crimson-950 mb-2">My Wishlist</h2>
              
              {wishlistedProducts.length === 0 ? (
                <div className="bg-white border border-gold-200/50 rounded-2xl p-10 text-center space-y-4 shadow-sm text-xs font-sans">
                  <Heart size={32} className="text-gold-500 mx-auto" />
                  <p className="text-obsidian-500 font-light">Your wishlist is empty. Tap the heart on products to save them here.</p>
                  <button onClick={() => navigateTo('shop')} className="bg-crimson-950 text-gold-100 font-bold uppercase tracking-wider px-6 py-2.5 rounded-full">
                    Start Wishlisting
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {wishlistedProducts.map(prod => (
                    <ProductCard 
                      key={prod.id} 
                      product={prod} 
                      onQuickView={(p) => setQuickViewProduct(p)} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-crimson-950">Shipping Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-1 bg-gold-50 hover:bg-gold-100 text-crimson-950 border border-gold-200 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]"
                >
                  <Plus size={12} />
                  <span>Add New</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white border border-gold-200/50 rounded-2xl p-10 text-center space-y-4 shadow-sm">
                  <MapPin size={32} className="text-gold-500 mx-auto" />
                  <p className="text-obsidian-500 font-light">No saved addresses yet. Add one to speed up checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr, idx) => (
                    <div 
                      key={addr.id} 
                      className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm space-y-2 relative"
                    >
                      <div className="font-bold text-crimson-950 text-sm">{addr.recipientName}</div>
                      <p className="font-light text-obsidian-700 leading-normal">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <div className="text-[10px] font-semibold text-obsidian-400">Mobile: {addr.phone}</div>
                      <div className="text-[10px] font-semibold text-obsidian-300">{addr.label}</div>
                      
                      {(addr.isDefault || idx === 0) && (
                        <span className="absolute top-4 right-4 bg-gold-400 text-crimson-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans scale-90">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Profile Details */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gold-200/50 p-6 sm:p-8 rounded-3xl shadow-gold shadow-sm font-sans text-xs space-y-6">
              <h2 className="font-serif text-xl font-bold text-crimson-950 border-b border-gold-100 pb-3">
                Profile Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-obsidian-400 text-[10px] uppercase tracking-wider block">Full Name</span>
                  <span className="text-sm font-bold text-obsidian-950 block">{profile.name || currentUser || '—'}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-obsidian-400 text-[10px] uppercase tracking-wider block">Email Address</span>
                  <span className="text-sm font-bold text-obsidian-950 block">{profile.email || currentUser || '—'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-obsidian-400 text-[10px] uppercase tracking-wider block">Total Orders</span>
                  <span className="text-sm font-bold text-obsidian-950 block">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-obsidian-400 text-[10px] uppercase tracking-wider block">Wishlist Items</span>
                  <span className="text-sm font-bold text-obsidian-950 block">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-gold-300 rounded-3xl overflow-hidden p-6 shadow-gold-xl animate-scaleIn font-sans text-xs">
            
            <button
              onClick={() => setShowAddAddress(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100"
            >
              <X size={16} />
            </button>

            <h3 className="font-serif text-lg font-bold text-crimson-950 mb-4 pb-2 border-b border-gold-100">
              Add New Address
            </h3>

            <form onSubmit={handleAddAddressSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">FullName</label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Mobile Number</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={newAddress.mobileNumber}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  placeholder="10-digit number"
                  className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Street Address</label>
                <textarea
                  required
                  rows={2}
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Flat No, Building, Street..."
                  className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none focus:border-gold-400 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-obsidian-800">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Mumbai"
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-obsidian-800">State</label>
                  <select
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none font-sans text-xs"
                  >
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-obsidian-800">Pincode</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="400054"
                    className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-crimson-950 text-gold-100 hover:bg-crimson-900 py-3 rounded-full font-bold uppercase tracking-wider mt-2 shadow-md"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Modal Hook */}
      <QuickViewModal 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    </div>
  );
};
