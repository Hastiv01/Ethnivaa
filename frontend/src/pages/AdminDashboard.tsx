import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import type { Product } from '../data/products';
import {
  ShieldCheck, Plus, Pencil, Trash2, IndianRupee, ShoppingBag, Users, AlertTriangle,
  X, Check, Save, Tag, RefreshCw, ChevronDown, ChevronUp, Package, Eye
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

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'users' | 'categories'>('products');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form states
  const [formFields, setFormFields] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    category: 'Traditional Jewellery Sets' as Product['category'],
    material: 'Oxidized Silver' as Product['material'],
    occasion: 'Festive' as Product['occasion'],
    description: '',
    materialsDetail: '',
    careInstructions: '',
    stock: 10,
    images: ['']
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

  // Categories state
  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

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

  // Fetch admin categories
  const fetchAdminCategories = useCallback(async () => {
    if (!authToken) return;
    setCategoriesLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  useEffect(() => {
    if (activeSubTab === 'users') fetchUsers();
    if (activeSubTab === 'categories') fetchAdminCategories();
  }, [activeSubTab, fetchUsers, fetchAdminCategories]);



  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) return;
    setCatSubmitting(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ name: newCatName.trim(), slug: newCatSlug.trim() })
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatSlug('');
        await fetchAdminCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add category');
      }
    } catch (err) {
      alert('Error adding category');
    } finally {
      setCatSubmitting(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        await fetchAdminCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

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
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      totalCustomers: new Set(orders.map(o => o.shippingAddress.fullName)).size,
      lowStock: products.filter(p => p.stock < 10).length,
    };
  }, [dashboardStats, orders, products]);

  const validCategories = categories.length > 0
    ? categories
    : [
        { id: 1, name: 'Traditional Jewellery Sets', slug: 'traditional-jewellery-sets' },
        { id: 2, name: 'Combo Sets', slug: 'combo-sets' }
      ];

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
      images: [...prod.images]
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    const defaultCategory = validCategories.length > 0 ? validCategories[0].name : 'Traditional Jewellery Sets';
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
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80']
    });
    setShowAddModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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

  const ProductFormFields = ({ onSubmit, submitLabel, icon }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string; icon: React.ReactNode }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-semibold text-obsidian-800">Ornament Title</label>
          <input type="text" name="name" required value={formFields.name} onChange={handleFormChange} placeholder="e.g. Royal Ruby Necklace Set" className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="font-semibold text-obsidian-800">Boutique Price</label>
            <input type="number" name="price" required min={0} value={formFields.price} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-obsidian-800">Original Price</label>
            <input type="number" name="originalPrice" min={0} value={formFields.originalPrice} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
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
          <input type="text" value={formFields.images[0]} onChange={(e) => setFormFields(prev => ({ ...prev, images: [e.target.value] }))} placeholder="https://images.unsplash.com/..." className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
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
      <button type="submit" className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md">
        {icon}
        <span>{submitLabel}</span>
      </button>
    </form>
  );

  return (
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
          { key: 'orders', label: `Orders (${orders.length})` },
          { key: 'users', label: 'Users' },
          { key: 'categories', label: 'Categories' },
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
            {orders.length === 0 ? (
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
                      <th className="p-4 text-right">Toggle Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-100 text-obsidian-850">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gold-50/10 transition-colors">
                        <td className="p-4 sm:p-5 font-bold font-mono text-crimson-950">{order.id}</td>
                        <td className="p-4 font-semibold text-obsidian-900">{order.shippingAddress.fullName}</td>
                        <td className="p-4 text-obsidian-500">{order.date}</td>
                        <td className="p-4 font-bold text-crimson-950 font-serif text-sm">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full font-bold uppercase text-[9px] ${order.paymentStatus === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <select value={order.status || 'Pending'} onChange={(e) => updateOrderStatus(order.id, e.target.value as any)} className="bg-ivory-50 border border-gold-300 text-obsidian-950 text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:border-gold-500 font-sans">
                            {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => updateOrderStatus(order.id, order.status, order.paymentStatus === 'Success' ? 'Processing' : 'Success')} className="text-[10px] font-bold uppercase border border-gold-300 hover:bg-gold-50 text-crimson-950 px-3 py-1.5 rounded-full transition-all">
                            Toggle Pay
                          </button>
                        </td>
                      </tr>
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

      {/* CATEGORIES TAB */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          {/* Add New Category */}
          <div className="bg-white border border-gold-200/50 rounded-2xl p-6 shadow-gold shadow-sm font-sans text-xs">
            <h3 className="font-serif text-lg font-bold text-crimson-950 mb-4 border-b border-gold-100 pb-3 flex items-center gap-2">
              <Tag size={18} className="text-gold-500" />
              Add New Category
            </h3>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                  }}
                  placeholder="e.g. Bridal Sets"
                  className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Slug (auto-generated)</label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="e.g. bridal-sets"
                  className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={catSubmitting}
                className="bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus size={14} />
                <span>{catSubmitting ? 'Adding...' : 'Add Category'}</span>
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white border border-gold-200/50 rounded-2xl overflow-hidden shadow-gold shadow-sm font-sans text-xs">
            {categoriesLoading ? (
              <p className="p-8 text-center text-obsidian-400 italic">Loading categories...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gold-50/50 border-b border-gold-100 text-gold-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">#</th>
                      <th className="p-4">Category Name</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4 text-center">Products</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-100 text-obsidian-850">
                    {adminCategories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gold-50/10 transition-colors">
                        <td className="p-4 font-mono text-obsidian-400">{cat.id}</td>
                        <td className="p-4 font-bold text-crimson-950">{cat.name}</td>
                        <td className="p-4 font-mono text-obsidian-500">{cat.slug}</td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full font-bold text-[9px] bg-gold-50 text-gold-700 border border-gold-200">
                            {cat.productCount ?? 0} products
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            disabled={(cat.productCount ?? 0) > 0}
                            className="p-2 rounded-full border border-crimson-100 hover:bg-crimson-50 text-crimson-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={(cat.productCount ?? 0) > 0 ? 'Move products first' : 'Delete category'}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {adminCategories.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-obsidian-400 italic">No categories found. Add one above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-gold-300 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-gold-xl animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar font-sans text-xs">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100"><X size={18} /></button>
            <h3 className="font-serif text-xl font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">Add Custom Ornament</h3>
            <ProductFormFields onSubmit={handleAddSubmit} submitLabel="Save and Display in Shop" icon={<Check size={14} />} />
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-gold-300 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-gold-xl animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar font-sans text-xs">
            <button onClick={() => { setShowEditModal(false); setEditingProductId(null); }} className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100"><X size={18} /></button>
            <h3 className="font-serif text-xl font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">Edit Ornament Details</h3>
            <ProductFormFields onSubmit={handleEditSubmit} submitLabel="Save Changes" icon={<Save size={14} />} />
          </div>
        </div>
      )}
    </div>
  );
};
