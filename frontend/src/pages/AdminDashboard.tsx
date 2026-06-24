import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import type { Product } from '../data/products';
import {
  ShieldCheck, Plus, Pencil, Trash2, IndianRupee, ShoppingBag, Users, AlertTriangle,
  X, Check, Save, RefreshCw, Package, Eye
} from 'lucide-react';

// Backend address type for admin orders
interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: string;
  authProvider?: string;
  emailVerifiedAt?: string;
  createdAt?: string;
  orderCount?: number;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
}

interface ProductFormFieldsProps {
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  icon: React.ReactNode;
  formFields: {
    name: string;
    price: number;
    originalPrice: number;
    category: Product['category'] | string;
    material: Product['material'] | string;
    occasion: Product['occasion'] | string;
    description: string;
    materialsDetail: string;
    careInstructions: string;
    stock: number;
    images: string[];
    isBestSeller?: boolean;
    isNewArrival?: boolean;
  };
  setFormFields: React.Dispatch<React.SetStateAction<any>>;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  validCategories: any[];
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  onSubmit, submitLabel, icon, formFields, setFormFields, handleFormChange, validCategories
}) => {
  const calculatedDiscount = formFields.originalPrice > 0 ? Math.round(((formFields.originalPrice - formFields.price) / formFields.originalPrice) * 100) : 0;
  
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const discount = Number(e.target.value);
    if (formFields.originalPrice > 0) {
      const newPrice = Math.round(formFields.originalPrice * (1 - discount / 100));
      setFormFields((prev: any) => ({ ...prev, price: Math.max(0, newPrice) }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-semibold text-obsidian-800">Ornament Title</label>
          <input type="text" name="name" required value={formFields.name} onChange={handleFormChange} placeholder="e.g. Royal Ruby Necklace Set" className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <label className="font-semibold text-obsidian-800 text-xs">Original Price</label>
            <input type="number" name="originalPrice" min={0} value={formFields.originalPrice} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-obsidian-800 text-xs">Discount %</label>
            <input type="number" name="discountPercentage" min={0} max={100} value={Math.max(0, calculatedDiscount)} onChange={handleDiscountChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-obsidian-800 text-xs">Selling Price</label>
            <input type="number" name="price" required min={0} value={formFields.price} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
          </div>
        </div>
      </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <label className="font-semibold text-obsidian-800">Collection Category</label>
        <select name="category" value={formFields.category} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none">
          {validCategories.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-obsidian-800">Base Metal / Material</label>
        <select name="material" value={formFields.material} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none">
          <option>22K Gold</option><option>Sterling Silver</option><option>Gold Plated</option><option>Oxidized Silver</option><option>Brass</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-obsidian-800">Recommended Occasion</label>
        <select name="occasion" value={formFields.occasion} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none">
          <option>Festive</option><option>Bridal</option><option>Casual Wear</option><option>Party Wear</option>
        </select>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="font-semibold text-obsidian-800">Boutique Stock Level</label>
        <input type="number" name="stock" required min={0} value={formFields.stock} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-obsidian-800">Showcase Image URL</label>
        <input type="text" value={formFields.images[0]} onChange={(e) => setFormFields((prev: any) => ({ ...prev, images: [e.target.value] }))} placeholder="/placeholder.png" className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
      </div>
    </div>
    <div className="space-y-1.5">
      <label className="font-semibold text-obsidian-800">Description</label>
      <textarea name="description" rows={3} value={formFields.description} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none resize-none"></textarea>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="font-semibold text-obsidian-800">Materials Detail</label>
        <input type="text" name="materialsDetail" value={formFields.materialsDetail} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-obsidian-800">Care Instructions</label>
        <input type="text" name="careInstructions" value={formFields.careInstructions} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="flex items-center gap-2 cursor-pointer p-3 bg-ivory-50 border border-gold-200 rounded-xl">
        <input type="checkbox" name="isBestSeller" checked={formFields.isBestSeller || false} onChange={handleFormChange} className="w-4 h-4 text-crimson-600 rounded border-gold-300 focus:ring-crimson-500" />
        <span className="font-semibold text-obsidian-800">Mark as Best Seller</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer p-3 bg-ivory-50 border border-gold-200 rounded-xl">
        <input type="checkbox" name="isNewArrival" checked={formFields.isNewArrival || false} onChange={handleFormChange} className="w-4 h-4 text-crimson-600 rounded border-gold-300 focus:ring-crimson-500" />
        <span className="font-semibold text-obsidian-800">Mark as New Arrival</span>
      </label>
    </div>
    <button type="submit" className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md">
      {icon}
      <span>{submitLabel}</span>
    </button>
    </form>
  );
};

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    categories,
    addProduct,
    editProduct,
    deleteProduct,
    updateOrderStatus,
    visitorCount,
  } = useShop();

  const authToken = JSON.parse(localStorage.getItem('ethnivaa_auth_token') || 'null');

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'users'>('products');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form states
  const [formFields, setFormFields] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    category: 'All Collections' as Product['category'],
    material: 'Oxidized Silver' as Product['material'],
    occasion: 'Festive' as Product['occasion'],
    description: '',
    materialsDetail: '',
    careInstructions: '',
    stock: 10,
    images: [''],
    isBestSeller: false,
    isNewArrival: false
  });

  // Search local filters
  const [productSearch, setProductSearch] = useState('');

  // Real dashboard stats from backend
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');



  // Fetch real dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    if (!authToken) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/orders/dashboard', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [authToken]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!authToken) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [authToken]);



  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    if (activeSubTab === 'users') fetchUsers();
  }, [activeSubTab, fetchUsers]);







  const paidOrders = useMemo(() => orders.filter(order => order.paymentStatus === 'Success'), [orders]);

  // Dashboard Metrics
  const metrics = useMemo(() => {
    if (dashboardStats) {
      return {
        totalOrders: dashboardStats.totalOrders,
        totalRevenue: dashboardStats.totalRevenue,
        totalCustomers: dashboardStats.totalCustomers,
        lowStock: dashboardStats.lowStockCount,
      };
    }
    // Fallback to local state while loading
    return {
      totalOrders: paidOrders.length,
      totalRevenue: paidOrders.reduce((sum, o) => sum + o.total, 0),
      totalCustomers: new Set(paidOrders.map(o => o.shippingAddress.fullName)).size,
      lowStock: products.filter(p => p.stock < 10).length,
    };
  }, [dashboardStats, paidOrders, products]);

  // Always restrict the dropdown to exactly these two categories
  const ALLOWED_CATEGORIES = ['All Collections'] as const;
  const validCategories = ALLOWED_CATEGORIES.map(name => {
    const found = categories.find(c => c.name === name);
    return found ?? { id: 0, name, slug: name.toLowerCase().replace(/\s+/g, '-') };
  });

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const openEditModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormFields({
      name: prod.name,
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      category: prod.category,
      material: prod.material,
      occasion: prod.occasion,
      description: prod.description,
      materialsDetail: prod.materialsDetail,
      careInstructions: prod.careInstructions,
      stock: prod.stock,
      images: [...prod.images],
      isBestSeller: !!prod.isBestSeller,
      isNewArrival: !!prod.isNewArrival
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    const defaultCategory = 'All Collections';
    setFormFields({
      name: '',
      price: 1500,
      originalPrice: 2000,
      category: defaultCategory as Product['category'],
      material: 'Oxidized Silver',
      occasion: 'Festive',
      description: 'Handcrafted luxury traditional ornament for special occasions.',
      materialsDetail: 'Premium base alloy layered with high-micron plating.',
      careInstructions: 'Avoid direct contact with water, sprays, and perfumes.',
      stock: 15,
      images: ['/placeholder.png'],
      isBestSeller: false,
      isNewArrival: false
    });
    setShowAddModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormFields(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({ ...formFields, originalPrice: formFields.originalPrice || undefined });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    editProduct(editingProductId, { ...formFields, originalPrice: formFields.originalPrice || undefined });
    setShowEditModal(false);
    setEditingProductId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to retire this product from the boutique?')) {
      deleteProduct(id);
    }
  };



  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn min-h-screen">

      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-gold-200/40">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-crimson-950 flex items-center gap-2">
            <ShieldCheck size={28} className="text-gold-500" />
            <span>Ethnivaa Administrative Boutique</span>
          </h1>
          <p className="text-xs text-obsidian-600 font-sans mt-1">
            Real-time shop catalog adjustments, orders tracking, and boutique metrics monitor
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={statsLoading}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson-950 border border-gold-300 px-4 py-2 rounded-full hover:bg-gold-50 transition-colors"
        >
          <RefreshCw size={12} className={statsLoading ? 'animate-spin' : ''} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-10 font-sans">
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-50 text-gold-600"><IndianRupee size={22} /></div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Boutique Revenue</span>
            <span className="text-lg sm:text-xl font-bold text-crimson-950">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-50 text-gold-600"><ShoppingBag size={22} /></div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Total Orders</span>
            <span className="text-lg sm:text-xl font-bold text-crimson-950">{metrics.totalOrders}</span>
          </div>
        </div>
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-50 text-gold-600"><Users size={22} /></div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Customers</span>
            <span className="text-lg sm:text-xl font-bold text-crimson-950">{metrics.totalCustomers}</span>
          </div>
        </div>
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-50 text-gold-600"><Eye size={22} /></div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Boutique Visitors</span>
            <span className="text-lg sm:text-xl font-bold text-crimson-950">{visitorCount.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4 col-span-2 md:col-span-1">
          <div className={`p-3 rounded-xl bg-gold-50 text-gold-600 ${metrics.lowStock > 0 ? 'bg-amber-50 text-amber-600 animate-pulse animate-duration-1000' : ''}`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Low Stock Items</span>
            <span className={`text-lg sm:text-xl font-bold ${metrics.lowStock > 0 ? 'text-amber-600' : 'text-crimson-950'}`}>{metrics.lowStock}</span>
          </div>
        </div>
      </div>

      {/* Navigation Inner Tabs */}
      <div className="flex border-b border-gold-200/50 mb-6 font-sans text-xs font-bold uppercase tracking-wider overflow-x-auto">
        {([
          { key: 'products', label: `Products (${products.length})` },
          { key: 'orders', label: `Orders (${paidOrders.length})` },
          { key: 'users', label: 'Users' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`py-3 px-5 whitespace-nowrap transition-colors ${
              activeSubTab === tab.key
                ? 'border-b-2 border-crimson-950 text-crimson-950 font-bold'
                : 'text-obsidian-400 hover:text-crimson-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PRODUCTS TAB */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
            <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search catalog products..." className="w-full sm:w-80 bg-white border border-gold-200 rounded-full py-2 px-4 focus:outline-none focus:border-gold-400 shadow-gold-sm text-obsidian-950" />
            <button onClick={openAddModal} className="w-full sm:w-auto bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md">
              <Plus size={16} /><span>Add New Ornament</span>
            </button>
          </div>
          <div className="bg-white border border-gold-200/50 rounded-2xl overflow-hidden shadow-gold shadow-sm font-sans text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gold-50/50 border-b border-gold-100 text-gold-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4 sm:p-5">Product Details</th>
                    <th className="p-4">Collection</th>
                    <th className="p-4">Material</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100 text-obsidian-850">
                  {filteredProducts.map(prod => (
                    <tr key={prod.id} className="hover:bg-gold-50/10 transition-colors">
                      <td className="p-4 sm:p-5 flex items-center gap-3">
                        <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 rounded-lg object-contain bg-white border border-gold-100 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-crimson-950 text-sm line-clamp-1">{prod.name}</div>
                          <div className="text-[10px] text-obsidian-400 font-mono">#{prod.id}</div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-obsidian-900">{prod.category}</td>
                      <td className="p-4 text-obsidian-600">{prod.material}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-bold uppercase text-[9px] ${prod.stock === 0 ? 'bg-crimson-50 text-crimson-700 border border-crimson-100' : prod.stock < 10 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                          {prod.stock === 0 ? 'Out of stock' : `${prod.stock} items`}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-crimson-950 font-serif text-sm">₹{prod.price.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button onClick={() => openEditModal(prod)} className="p-2 rounded-full border border-gold-200 hover:bg-gold-50 text-crimson-950 transition-colors" title="Edit details"><Pencil size={12} /></button>
                          <button onClick={() => handleDelete(prod.id)} className="p-2 rounded-full border border-crimson-100 hover:bg-crimson-50 text-crimson-700 transition-colors" title="Delete"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-obsidian-400 italic">No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white border border-gold-200/50 rounded-2xl overflow-hidden shadow-gold shadow-sm font-sans text-xs">
            {paidOrders.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Package size={32} className="text-gold-400 mx-auto" />
                <p className="text-obsidian-400 italic">No orders found yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gold-50/50 border-b border-gold-100 text-gold-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4 sm:p-5">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-100 text-obsidian-850">
                    {paidOrders.map(order => (
                      <React.Fragment key={order.id}>
                        <tr
                          className="hover:bg-gold-50/10 cursor-pointer transition-colors"
                          onClick={() => toggleOrderExpand(order.id)}
                        >
                          <td className="p-4 sm:p-5 font-bold font-mono text-crimson-950">{order.id}</td>
                          <td className="p-4 font-semibold text-obsidian-900">{order.shippingAddress.fullName}</td>
                          <td className="p-4 text-obsidian-500">{order.date}</td>
                          <td className="p-4 font-bold text-crimson-950 font-serif text-sm">₹{order.total.toLocaleString('en-IN')}</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full font-bold uppercase text-[9px] ${order.paymentStatus === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <select value={order.status || 'Pending'} onChange={(e) => updateOrderStatus(order.id, e.target.value as any)} className="bg-ivory-50 border border-gold-300 text-obsidian-950 text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:border-gold-500 font-sans">
                              {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleOrderExpand(order.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] bg-gold-50 text-gold-700 border border-gold-200 hover:bg-gold-100 transition-colors"
                            >
                              <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                              <Eye size={12} className={expandedOrderId === order.id ? "text-crimson-900" : "text-gold-500"} />
                            </button>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr className="bg-ivory-100/30 border-b border-gold-100/50">
                            <td colSpan={7} className="p-5">
                              {/* Beautiful Expandable Order Details Card */}
                              <div className="space-y-4 font-sans max-w-4xl mx-auto text-left">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold-200 pb-3 gap-2">
                                  <div>
                                    <h4 className="text-sm font-bold text-crimson-950 uppercase tracking-wider flex items-center gap-1.5">
                                      <Package size={14} className="text-gold-600" />
                                      <span>Order Items details (Order #{order.id})</span>
                                    </h4>
                                    <p className="text-[11px] text-obsidian-500 mt-0.5 font-sans">Prepare these items for the customer. Double check the colors & materials.</p>
                                  </div>
                                  <div className="text-[10px] font-bold text-gold-800 bg-gold-50 border border-gold-200 px-3 py-1 rounded-md flex items-center gap-1">
                                    <span>Total items to make:</span>
                                    <strong className="text-crimson-900 text-xs">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  {/* List of Items */}
                                  <div className="md:col-span-2 space-y-3">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex gap-4 bg-white p-3.5 rounded-xl border border-gold-100 shadow-gold-sm hover:shadow-gold transition-shadow">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-16 h-16 rounded-lg object-cover border border-gold-200 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                          <div>
                                            <p className="text-sm font-bold text-obsidian-950 leading-snug">{item.name}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                              {item.color && (
                                                <span className="px-2 py-0.5 rounded text-[9px] bg-slate-50 text-slate-700 font-bold border border-slate-200 uppercase tracking-wider">
                                                  Color: {item.color}
                                                </span>
                                              )}
                                              {item.material && (
                                                <span className="px-2 py-0.5 rounded text-[9px] bg-amber-50 text-amber-900 font-bold border border-amber-100 uppercase tracking-wider">
                                                  Material: {item.material}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <p className="text-xs text-obsidian-500 mt-1 font-medium">
                                            Unit Price: ₹{item.price.toLocaleString('en-IN')}
                                          </p>
                                        </div>
                                        <div className="text-right flex flex-col justify-between flex-shrink-0 py-0.5">
                                          <div className="text-xs font-bold text-crimson-950 bg-crimson-50 px-2.5 py-0.5 rounded border border-crimson-100 self-end">
                                            Qty: {item.quantity}
                                          </div>
                                          <p className="text-sm font-extrabold text-obsidian-900 font-serif">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Shipping / Address card */}
                                  <div className="bg-white p-4 rounded-xl border border-gold-200/50 shadow-gold-sm space-y-3">
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-gold-700 pb-1.5 border-b border-gold-100 flex items-center gap-1.5">
                                      <ShoppingBag size={12} className="text-gold-500" />
                                      <span>Shipping Details</span>
                                    </h5>
                                    <div className="text-xs space-y-2.5 text-obsidian-850">
                                      <div>
                                        <span className="font-semibold block text-[10px] text-obsidian-400 uppercase tracking-wider">Recipient Name</span>
                                        <span className="font-bold text-obsidian-900 text-xs">{order.shippingAddress.fullName}</span>
                                      </div>
                                      <div>
                                        <span className="font-semibold block text-[10px] text-obsidian-400 uppercase tracking-wider">Contact Phone</span>
                                        <a href={`tel:${order.shippingAddress.mobileNumber}`} className="text-crimson-800 font-bold hover:underline">{order.shippingAddress.mobileNumber}</a>
                                      </div>
                                      <div>
                                        <span className="font-semibold block text-[10px] text-obsidian-400 uppercase tracking-wider">Delivery Address</span>
                                        <span className="leading-relaxed block text-obsidian-700 bg-ivory-50 p-2 rounded border border-gold-100/50 mt-1 font-mono text-[10px]">
                                          {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
            <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users by name, email, role..." className="w-full sm:w-80 bg-white border border-gold-200 rounded-full py-2 px-4 focus:outline-none focus:border-gold-400 shadow-gold-sm text-obsidian-950" />
            <button onClick={fetchUsers} disabled={usersLoading} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson-950 border border-gold-300 px-4 py-2 rounded-full hover:bg-gold-50 transition-colors">
              <RefreshCw size={12} className={usersLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="bg-white border border-gold-200/50 rounded-2xl overflow-hidden shadow-gold shadow-sm font-sans text-xs">
            {usersLoading ? (
              <p className="p-8 text-center text-obsidian-400 italic">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gold-50/50 border-b border-gold-100 text-gold-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">#</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Orders</th>
                      <th className="p-4 font-normal">Provider</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-100 text-obsidian-850">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gold-50/10 transition-colors">
                        <td className="p-4 font-mono text-obsidian-400">{user.id}</td>
                        <td className="p-4 font-bold text-crimson-950">{user.name}</td>
                        <td className="p-4 text-obsidian-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full font-bold uppercase text-[9px] ${user.role === 'ADMIN' ? 'bg-crimson-50 text-crimson-700 border border-crimson-100' : 'bg-gold-50 text-gold-700 border border-gold-200'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-obsidian-600">{user.orderCount ?? 0}</td>
                        <td className="p-4 text-obsidian-400">{user.authProvider || 'EMAIL'}</td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-obsidian-400 italic">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}



      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-gold-300 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-gold-xl animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar font-sans text-xs">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100"><X size={18} /></button>
            <h3 className="font-serif text-xl font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">Add Custom Ornament</h3>
            <ProductFormFields 
              onSubmit={handleAddSubmit} 
              submitLabel="Save and Display in Shop" 
              icon={<Check size={14} />} 
              formFields={formFields} 
              setFormFields={setFormFields} 
              handleFormChange={handleFormChange} 
              validCategories={validCategories} 
            />
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-gold-300 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-gold-xl animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar font-sans text-xs">
            <button onClick={() => { setShowEditModal(false); setEditingProductId(null); }} className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100"><X size={18} /></button>
            <h3 className="font-serif text-xl font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">Edit Ornament Details</h3>
            <ProductFormFields 
              onSubmit={handleEditSubmit} 
              submitLabel="Save Changes" 
              icon={<Save size={14} />} 
              formFields={formFields} 
              setFormFields={setFormFields} 
              handleFormChange={handleFormChange} 
              validCategories={validCategories} 
            />
          </div>
        </div>
      )}
    </>
  );
};
