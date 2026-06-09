import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import type { Order } from '../context/ShopContext';
import type { Product } from '../data/products';
import { ShieldCheck, Plus, Pencil, Trash2, IndianRupee, ShoppingBag, Users, AlertTriangle, X, Check, Save } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    addProduct, 
    editProduct, 
    deleteProduct, 
    updateOrderStatus 
  } = useShop();

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders'>('products');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form states
  const [formFields, setFormFields] = useState({
    name: '',
    price: 0,
    originalPrice: 0,
    category: 'Navratri' as Product['category'],
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

  // 1. Dashboard Metrics Calculations
  const metrics = useMemo(() => {
    // Add mock background statistics for realistic corporate feel
    const baseOrdersCount = 124;
    const baseCustomersCount = 82;
    const baseRevenue = 894500;

    const actualOrdersCount = orders.length;
    const actualRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    
    // Customers count
    const customerNames = new Set(orders.map(o => o.shippingAddress.fullName));
    const actualCustomersCount = customerNames.size;

    const lowStockCount = products.filter(p => p.stock < 10).length;

    return {
      totalOrders: baseOrdersCount + actualOrdersCount,
      totalRevenue: baseRevenue + actualRevenue,
      totalCustomers: baseCustomersCount + actualCustomersCount,
      lowStock: lowStockCount
    };
  }, [orders, products]);

  // Filter products for the table
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Open Edit Modal
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

  // Open Add Modal
  const openAddModal = () => {
    setFormFields({
      name: '',
      price: 1500,
      originalPrice: 2000,
      category: 'Navratri',
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
    addProduct({
      ...formFields,
      originalPrice: formFields.originalPrice || undefined
    });
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    editProduct(editingProductId, {
      ...formFields,
      originalPrice: formFields.originalPrice || undefined
    });
    setShowEditModal(false);
    setEditingProductId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to retire this product from the boutique?')) {
      deleteProduct(id);
    }
  };

  const toggleOrderStatus = (orderId: string, currentStatus: Order['paymentStatus']) => {
    const newStatus = currentStatus === 'Success' ? 'Processing' : 'Success';
    updateOrderStatus(orderId, newStatus);
  };

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
      </div>

      {/* 2. Key Metrics Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 font-sans">
        
        {/* Metric: Revenue */}
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-50 text-gold-600">
            <IndianRupee size={22} />
          </div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Boutique Revenue</span>
            <span className="text-lg sm:text-xl font-bold text-crimson-950">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Metric: Orders */}
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-50 text-gold-600">
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Total Orders</span>
            <span className="text-lg sm:text-xl font-bold text-crimson-950">{metrics.totalOrders}</span>
          </div>
        </div>

        {/* Metric: Customers */}
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-50 text-gold-600">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Boutique Patrons</span>
            <span className="text-lg sm:text-xl font-bold text-crimson-950">{metrics.totalCustomers}</span>
          </div>
        </div>

        {/* Metric: Low Stock Alerts */}
        <div className="bg-white border border-gold-200/50 p-5 rounded-2xl shadow-gold shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${metrics.lowStock > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-gold-50 text-gold-600'}`}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="text-[10px] text-obsidian-400 font-semibold uppercase tracking-wider block">Low Stock Items</span>
            <span className={`text-lg sm:text-xl font-bold ${metrics.lowStock > 0 ? 'text-amber-600' : 'text-crimson-950'}`}>
              {metrics.lowStock}
            </span>
          </div>
        </div>

      </div>

      {/* 3. Navigation Inner Tabs */}
      <div className="flex border-b border-gold-200/50 mb-6 font-sans text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`py-3 px-6 transition-colors ${
            activeSubTab === 'products' 
              ? 'border-b-2 border-crimson-950 text-crimson-950 font-bold' 
              : 'text-obsidian-400 hover:text-crimson-900'
          }`}
        >
          Product Management ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`py-3 px-6 transition-colors ${
            activeSubTab === 'orders' 
              ? 'border-b-2 border-crimson-950 text-crimson-950 font-bold' 
              : 'text-obsidian-400 hover:text-crimson-900'
          }`}
        >
          Recent Orders Log ({orders.length})
        </button>
      </div>

      {/* 4. Sub-Tab Content: PRODUCTS CRUD */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-sans text-xs">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search catalog products..."
              className="w-full sm:w-80 bg-white border border-gold-200 rounded-full py-2 px-4 focus:outline-none focus:border-gold-400 shadow-gold-sm text-obsidian-950"
            />
            
            <button
              onClick={openAddModal}
              className="w-full sm:w-auto bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus size={16} />
              <span>Add New Ornament</span>
            </button>
          </div>

          {/* Catalog Table */}
          <div className="bg-white border border-gold-200/50 rounded-2xl overflow-hidden shadow-gold shadow-sm font-sans text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gold-50/50 border-b border-gold-100 text-gold-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4 sm:p-5">Product Details</th>
                    <th className="p-4">Collection</th>
                    <th className="p-4">Material</th>
                    <th className="p-4 text-center">Boutique Stock</th>
                    <th className="p-4">Boutique Price</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100 text-obsidian-850">
                  {filteredProducts.map(prod => (
                    <tr key={prod.id} className="hover:bg-gold-50/10 transition-colors">
                      {/* Image + Title */}
                      <td className="p-4 sm:p-5 flex items-center gap-3">
                        <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-gold-100 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-crimson-950 text-sm line-clamp-1">{prod.name}</div>
                          <div className="text-[10px] text-obsidian-400 font-mono">{prod.id}</div>
                        </div>
                      </td>
                      
                      {/* Category */}
                      <td className="p-4 font-semibold text-obsidian-900">{prod.category}</td>
                      
                      {/* Material */}
                      <td className="p-4 text-obsidian-600">{prod.material}</td>
                      
                      {/* Stock Badges */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-bold uppercase text-[9px] ${
                          prod.stock === 0 
                            ? 'bg-crimson-50 text-crimson-700 border border-crimson-100' 
                            : prod.stock < 10 
                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {prod.stock === 0 ? 'Out of stock' : `${prod.stock} items`}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-bold text-crimson-950 font-serif text-sm">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 rounded-full border border-gold-200 hover:bg-gold-50 text-crimson-950 transition-colors"
                            title="Edit details"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-2 rounded-full border border-crimson-100 hover:bg-crimson-50 text-crimson-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Sub-Tab Content: ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white border border-gold-200/50 rounded-2xl overflow-hidden shadow-gold shadow-sm font-sans text-xs">
            {orders.length === 0 ? (
              <p className="p-8 text-center text-obsidian-400 italic">No customer orders have been placed in this session yet.</p>
            ) : (
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gold-50/50 border-b border-gold-100 text-gold-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4 sm:p-5">Order Reference</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Order Date</th>
                      <th className="p-4">Paid Total</th>
                      <th className="p-4">Billing Status</th>
                      <th className="p-4 text-right">Toggle Status</th>
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
                          <span className={`inline-block px-3 py-1 rounded-full font-bold uppercase text-[9px] ${
                            order.paymentStatus === 'Success' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleOrderStatus(order.id, order.paymentStatus)}
                            className="text-[10px] font-bold uppercase border border-gold-300 hover:bg-gold-50 text-crimson-950 px-3 py-1.5 rounded-full transition-all"
                          >
                            Toggle Status
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

      {/* ADD BOUTIQUE ORNAMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-gold-300 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-gold-xl animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar font-sans text-xs">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100">
              <X size={18} />
            </button>
            <h3 className="font-serif text-xl font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">Add Custom Ornament</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
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
                    <option value="Navratri">Navratri Collection</option>
                    <option value="Oxidized">Oxidized Jewelry</option>
                    <option value="Kundan">Kundan Collection</option>
                    <option value="Temple">Temple Jewelry</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Base Metal / Material</label>
                  <select name="material" value={formFields.material} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none">
                    <option value="22K Gold">22K Gold</option>
                    <option value="Sterling Silver">Sterling Silver</option>
                    <option value="Gold Plated">Gold Plated</option>
                    <option value="Oxidized Silver">Oxidized Silver</option>
                    <option value="Brass">Brass</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Recommended Occasion</label>
                  <select name="occasion" value={formFields.occasion} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none">
                    <option value="Festive">Festive</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Casual Wear">Casual Wear</option>
                    <option value="Party Wear">Party Wear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Boutique Stock Level</label>
                  <input type="number" name="stock" required min={0} value={formFields.stock} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Unsplash Showcase Image URL</label>
                  <input type="text" value={formFields.images[0]} onChange={(e) => setFormFields(prev => ({ ...prev, images: [e.target.value] }))} placeholder="https://images.unsplash.com/..." className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Description</label>
                <textarea name="description" rows={3} value={formFields.description} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Materials Detail specs</label>
                  <input type="text" name="materialsDetail" value={formFields.materialsDetail} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Care Instructions</label>
                  <input type="text" name="careInstructions" value={formFields.careInstructions} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md">
                <Check size={14} />
                <span>Save and Display in Shop</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOUTIQUE ORNAMENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-gold-300 rounded-3xl overflow-hidden p-6 sm:p-8 shadow-gold-xl animate-scaleIn max-h-[90vh] overflow-y-auto custom-scrollbar font-sans text-xs">
            <button onClick={() => { setShowEditModal(false); setEditingProductId(null); }} className="absolute top-4 right-4 p-2 rounded-full bg-ivory-100 text-crimson-950 hover:bg-gold-100">
              <X size={18} />
            </button>
            <h3 className="font-serif text-xl font-bold text-crimson-950 mb-6 border-b border-gold-100 pb-3">Edit Ornament Details</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Ornament Title</label>
                  <input type="text" name="name" required value={formFields.name} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
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
                    <option value="Navratri">Navratri Collection</option>
                    <option value="Oxidized">Oxidized Jewelry</option>
                    <option value="Kundan">Kundan Collection</option>
                    <option value="Temple">Temple Jewelry</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Base Metal / Material</label>
                  <select name="material" value={formFields.material} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none">
                    <option value="22K Gold">22K Gold</option>
                    <option value="Sterling Silver">Sterling Silver</option>
                    <option value="Gold Plated">Gold Plated</option>
                    <option value="Oxidized Silver">Oxidized Silver</option>
                    <option value="Brass">Brass</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Recommended Occasion</label>
                  <select name="occasion" value={formFields.occasion} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none">
                    <option value="Festive">Festive</option>
                    <option value="Bridal">Bridal</option>
                    <option value="Casual Wear">Casual Wear</option>
                    <option value="Party Wear">Party Wear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Boutique Stock Level</label>
                  <input type="number" name="stock" required min={0} value={formFields.stock} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Image Showcase URL</label>
                  <input type="text" value={formFields.images[0]} onChange={(e) => setFormFields(prev => ({ ...prev, images: [e.target.value] }))} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-obsidian-800">Description</label>
                <textarea name="description" rows={3} value={formFields.description} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none resize-none"></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Materials Detail specs</label>
                  <input type="text" name="materialsDetail" value={formFields.materialsDetail} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-obsidian-800">Care Instructions</label>
                  <input type="text" name="careInstructions" value={formFields.careInstructions} onChange={handleFormChange} className="w-full bg-ivory-50 border border-gold-200 rounded-xl p-2.5 focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-crimson-950 hover:bg-crimson-900 text-gold-100 font-bold uppercase tracking-wider py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md">
                <Save size={14} />
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
