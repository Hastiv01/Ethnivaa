import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockProducts } from '../data/products';
import type { Product, Review } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  backendItemId?: number; // stored for backend syncing
}

export interface ShippingAddress {
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Profile {
  name: string;
  email: string;
  mobile: string;
  savedAddresses: ShippingAddress[];
}

type AuthResult = {
  success: boolean;
  message: string;
  signupToken?: string;
};

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: 'Success' | 'Processing' | 'Failed';
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  shipping: number;
  total: number;
}

export type PageType = 'welcome' | 'home' | 'shop' | 'details' | 'cart' | 'checkout' | 'success' | 'account' | 'admin' | 'login' | 'signup';

interface ShopContextType {
  // Routing State
  currentPage: PageType;
  selectedProductId: string | null;
  navigateTo: (page: PageType, productId?: string | null) => void;

  // Search & Filter state sharing
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (category: string | null) => void;

  // Products state (supports Admin CRUD)
  products: Product[];
  categories: { id: number; name: string; slug: string }[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'reviews'>) => void;
  editProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'date' | 'verified'>) => void;

  // Cart State
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartShippingCost: number;
  cartTotal: number;

  // Wishlist State
  wishlist: string[]; // array of product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Order State
  orders: Order[];
  placeOrder: (shippingAddress: ShippingAddress, paymentMethod: string) => Promise<Order>;
  latestOrder: Order | null;
  updateOrderStatus: (orderId: string, status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled', paymentStatus?: 'Success' | 'Processing' | 'Failed') => void;

  // Profile State
  profile: Profile;
  saveProfileAddress: (address: ShippingAddress) => void;

  // Admin View State
  isAdminView: boolean;
  setIsAdminView: (val: boolean) => void;

  // Account Tab State
  activeAccountTab: 'orders' | 'wishlist' | 'addresses' | 'profile';
  setActiveAccountTab: (tab: 'orders' | 'wishlist' | 'addresses' | 'profile') => void;

  // Auth State
  currentUser: string | null;
  currentUserRole: string | null;
  pendingAction: any;
  setPendingAction: (action: any) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  startSignup: (name: string, email: string) => Promise<AuthResult>;
  verifySignupOtp: (email: string, otp: string) => Promise<AuthResult>;
  completeSignup: (signupToken: string, password: string) => Promise<AuthResult>;
  googleSignIn: (idToken: string) => Promise<AuthResult>;
  logout: () => void;
}

const safeParse = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    const parsed = JSON.parse(saved);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    if (typeof defaultValue === 'object' && defaultValue !== null && (typeof parsed !== 'object' || parsed === null)) {
      return defaultValue;
    }
    return parsed;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
};

const apiRequest = async <T,>(path: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.message === 'string' ? payload.message : 'Request failed';
    throw new Error(message);
  }

  return payload as T;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageType>('welcome');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Categories list from database
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);

  // Load initial products (will be hydrated from backend on load)
  const [products, setProducts] = useState<Product[]>(() => {
    return safeParse('ethnivaa_products_v2', mockProducts);
  });

  // Load Cart from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return safeParse('ethnivaa_cart', []);
  });

  // Load Wishlist from localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return safeParse('ethnivaa_wishlist', []);
  });

  // Load Orders from localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    return safeParse('ethnivaa_orders', []);
  });

  const [latestOrder, setLatestOrder] = useState<Order | null>(() => {
    return safeParse<Order | null>('ethnivaa_latest_order', null);
  });

  // Profile State
  const [profile, setProfile] = useState<Profile>(() => {
    return safeParse<Profile>('ethnivaa_profile', {
      name: 'Aditi Sharma',
      email: 'aditi.sharma@gmail.com',
      mobile: '+91 98765 43210',
      savedAddresses: [
        {
          fullName: 'Aditi Sharma',
          mobileNumber: '9876543210',
          address: '402, Royal Residency, Linking Road, Santacruz West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400054'
        }
      ]
    });
  });

  const [activeAccountTab, setActiveAccountTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');

  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return safeParse<string | null>('ethnivaa_current_user', null);
  });

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(() => {
    return safeParse<string | null>('ethnivaa_current_user_role', null);
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return safeParse<string | null>('ethnivaa_auth_token', null);
  });

  const [isAdminView, setIsAdminViewState] = useState<boolean>(() => {
    const role = safeParse<string | null>('ethnivaa_current_user_role', null);
    return role === 'ADMIN';
  });

  const [pendingAction, setPendingAction] = useState<any>(null);

  // Helper mapper function
  const mapBackendProductToFrontend = (p: any): Product => {
    let imagesArr: string[] = [];
    if (p.images) {
      if (Array.isArray(p.images)) {
        imagesArr = p.images;
      } else {
        try {
          imagesArr = JSON.parse(p.images);
        } catch (e) {
          imagesArr = [p.image || ''];
        }
      }
    } else if (p.image) {
      imagesArr = [p.image];
    }

    return {
      id: String(p.id),
      name: p.title || '',
      price: Number(p.price) || 0,
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      rating: Number(p.rating) || 5.0,
      reviewsCount: Number(p.reviewsCount) || 0,
      category: p.Category?.name || p.category || 'Traditional Jewellery Sets',
      material: p.material || 'Oxidized Silver',
      occasion: p.occasion || 'Festive',
      images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
      description: p.description || '',
      materialsDetail: p.materialsDetail || '',
      careInstructions: p.careInstructions || '',
      stock: Number(p.inventory) || 0,
      reviews: Array.isArray(p.Reviews) ? p.Reviews.map((r: any) => ({
        id: String(r.id),
        userName: r.User?.name || 'Customer',
        rating: Number(r.rating) || 5,
        date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        comment: r.comment || '',
        verified: true
      })) : [],
      isBestSeller: Boolean(p.isBestSeller),
      isNewArrival: Boolean(p.isNewArrival)
    };
  };

  // 1. Fetch categories and products from backend on load
  const loadBackendData = async () => {
    try {
      // Load categories
      const catRes = await fetch('/api/products/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      // Load products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData.products)) {
          const mapped = prodData.products.map(mapBackendProductToFrontend);
          setProducts(mapped);
        }
      }
    } catch (e) {
      console.error('Failed to load initial data from backend:', e);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // 2. Fetch customer/admin orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser || !authToken) {
        setOrders([]);
        return;
      }
      try {
        const url = currentUserRole === 'ADMIN' ? '/api/admin/orders' : '/api/orders/me';
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.orders || []).map((o: any) => {
            const items = (o.OrderItems || []).map((item: any) => ({
              productId: String(item.productId),
              name: item.Product?.title || 'Jewelry Item',
              price: Number(item.unitPrice) || 0,
              image: item.Product?.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
              quantity: Number(item.quantity) || 1
            }));
            const addr = o.Address || {};
            return {
              id: String(o.id || o.orderNumber),
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-IN'),
              items,
              shippingAddress: {
                fullName: addr.recipientName || 'Customer',
                mobileNumber: addr.phone || '',
                address: `${addr.line1 || ''} ${addr.line2 || ''}`.trim(),
                city: addr.city || '',
                state: addr.state || '',
                pincode: addr.postalCode || ''
              },
              paymentMethod: 'Prepaid / Card',
              paymentStatus: o.paymentStatus === 'SUCCESS' ? 'Success' : 'Processing',
              status: o.status === 'CONFIRMED' ? 'Confirmed' : o.status === 'PROCESSING' ? 'Processing' : o.status === 'SHIPPED' ? 'Shipped' : o.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : o.status === 'DELIVERED' ? 'Delivered' : o.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
              subtotal: Number(o.subtotal) || 0,
              shipping: Number(o.shippingCost) || 0,
              total: Number(o.total) || 0
            };
          });
          setOrders(mapped);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      }
    };
    loadOrders();
  }, [currentUser, currentUserRole, authToken]);

  // 3. Load customer cart from backend
  useEffect(() => {
    const loadCart = async () => {
      if (!currentUser || !authToken) {
        return;
      }
      try {
        const response = await fetch('/api/cart', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.cart && Array.isArray(data.cart.items)) {
            const mapped = data.cart.items.map((item: any) => ({
              product: mapBackendProductToFrontend(item.product),
              quantity: Number(item.quantity),
              backendItemId: item.id
            }));
            setCartItems(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCart();
  }, [currentUser, authToken]);

  // Sync state to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ethnivaa_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ethnivaa_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUserRole) {
      localStorage.setItem('ethnivaa_current_user_role', JSON.stringify(currentUserRole));
    } else {
      localStorage.removeItem('ethnivaa_current_user_role');
    }
  }, [currentUserRole]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('ethnivaa_auth_token', JSON.stringify(authToken));
    } else {
      localStorage.removeItem('ethnivaa_auth_token');
    }
  }, [authToken]);

  useEffect(() => {
    if (currentUser && pendingAction) {
      const { type, fromPage } = pendingAction;
      if (type === 'cart') {
        addToCart(pendingAction.product, pendingAction.quantity);
        if (fromPage) navigateTo(fromPage);
      } else if (type === 'wishlist') {
        toggleWishlist(pendingAction.productId);
        if (fromPage) navigateTo(fromPage);
      } else if (type === 'navigation') {
        navigateTo(pendingAction.page, pendingAction.productId);
      }
      setPendingAction(null);
    }
  }, [currentUser, pendingAction]);

  useEffect(() => {
    localStorage.setItem('ethnivaa_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('ethnivaa_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('ethnivaa_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (latestOrder) {
      localStorage.setItem('ethnivaa_latest_order', JSON.stringify(latestOrder));
    } else {
      localStorage.removeItem('ethnivaa_latest_order');
    }
  }, [latestOrder]);

  useEffect(() => {
    localStorage.setItem('ethnivaa_profile', JSON.stringify(profile));
  }, [profile]);

  // Navigation controller
  const navigateTo = (page: PageType, productId: string | null = null) => {
    if ((page === 'checkout' || page === 'account' || page === 'admin') && !currentUser) {
      setPendingAction({ type: 'navigation', page, productId, fromPage: currentPage });
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    setSelectedProductId(productId);
    window.scrollTo(0, 0);
  };

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
  };

  const setIsAdminView = (val: boolean) => {
    setIsAdminViewState(val);
    if (val) {
      navigateTo('admin');
    } else {
      navigateTo('home');
    }
  };

  // Admin CRUD Operations
  const addProduct = async (newProd: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'reviews'>) => {
    try {
      // Find category from DB list first
      let categoryObj = categories.find(
        c => c.name.toLowerCase() === newProd.category.toLowerCase()
      );

      // If not found in loaded list, try to fetch fresh categories from backend
      if (!categoryObj) {
        try {
          const catRes = await fetch('/api/products/categories');
          if (catRes.ok) {
            const catData = await catRes.json();
            const freshCats: { id: number; name: string; slug: string }[] = catData.categories || [];
            setCategories(freshCats);
            categoryObj = freshCats.find(
              c => c.name.toLowerCase() === newProd.category.toLowerCase()
            );
          }
        } catch (_) { /* ignore */ }
      }

      if (!categoryObj) {
        alert(`Category "${newProd.category}" does not exist in the database yet.\n\nPlease run the backend seed script first:\n  npm run seed\n\nOr ask your admin to create this category in the database.`);
        return;
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: newProd.name,
          description: newProd.description,
          price: newProd.price,
          originalPrice: newProd.originalPrice,
          material: newProd.material,
          occasion: newProd.occasion,
          images: newProd.images,
          materialsDetail: newProd.materialsDetail,
          careInstructions: newProd.careInstructions,
          stock: newProd.stock,
          categoryId: categoryObj.id,
          isBestSeller: newProd.isBestSeller,
          isNewArrival: newProd.isNewArrival
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.product) {
          const mapped = mapBackendProductToFrontend(data.product);
          setProducts(prev => [mapped, ...prev]);
        }
      } else {
        const err = await response.json();
        alert(`Failed to add product: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error creating product');
    }
  };

  const editProduct = async (id: string, updatedFields: Partial<Product>) => {
    // Mock/seed products have non-numeric IDs (e.g. "eth-008") — update locally only
    const isDbProduct = /^\d+$/.test(id);

    if (!isDbProduct) {
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, ...updatedFields } : p
      ));
      return;
    }

    try {
      const categoryObj = updatedFields.category 
        ? (categories.find(c => c.name.toLowerCase() === updatedFields.category?.toLowerCase()) || categories[0])
        : undefined;

      const body: any = {};
      if (updatedFields.name !== undefined) body.title = updatedFields.name;
      if (updatedFields.description !== undefined) body.description = updatedFields.description;
      if (updatedFields.price !== undefined) body.price = updatedFields.price;
      if (updatedFields.originalPrice !== undefined) body.originalPrice = updatedFields.originalPrice;
      if (updatedFields.material !== undefined) body.material = updatedFields.material;
      if (updatedFields.occasion !== undefined) body.occasion = updatedFields.occasion;
      if (updatedFields.images !== undefined) body.images = updatedFields.images;
      if (updatedFields.materialsDetail !== undefined) body.materialsDetail = updatedFields.materialsDetail;
      if (updatedFields.careInstructions !== undefined) body.careInstructions = updatedFields.careInstructions;
      if (updatedFields.stock !== undefined) body.stock = updatedFields.stock;
      if (categoryObj) body.categoryId = categoryObj.id;
      if (updatedFields.isBestSeller !== undefined) body.isBestSeller = updatedFields.isBestSeller;
      if (updatedFields.isNewArrival !== undefined) body.isNewArrival = updatedFields.isNewArrival;

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.product) {
          const mapped = mapBackendProductToFrontend(data.product);
          setProducts(prev => prev.map(p => p.id === id ? mapped : p));
        }
      } else {
        const err = await response.json();
        alert(`Failed to update product: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error editing product');
    }
  };

  const deleteProduct = async (id: string) => {
    // Mock/seed products have non-numeric IDs (e.g. "eth-008") — delete locally only
    const isDbProduct = /^\d+$/.test(id);

    if (!isDbProduct) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProductId === id) {
        setSelectedProductId(null);
        setCurrentPage('shop');
      }
      setCartItems(prev => prev.filter(item => item.product.id !== id));
      setWishlist(prev => prev.filter(wishId => wishId !== id));
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        if (selectedProductId === id) {
          setSelectedProductId(null);
          setCurrentPage('shop');
        }
        setCartItems(prev => prev.filter(item => item.product.id !== id));
        setWishlist(prev => prev.filter(wishId => wishId !== id));
      } else {
        const err = await response.json();
        alert(`Failed to delete product: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting product');
    }
  };

  const addReview = (productId: string, newReview: Omit<Review, 'id' | 'date' | 'verified'>) => {
    const review: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedReviews = [review, ...p.reviews];
        const avgRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
        return {
          ...p,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: avgRating
        };
      }
      return p;
    }));
  };

  // Cart operations (backend synced)
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      setPendingAction({ type: 'cart', product, quantity, fromPage: currentPage });
      navigateTo('login');
      return;
    }
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ productId: Number(product.id), quantity })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.cart && Array.isArray(data.cart.items)) {
          const mapped = data.cart.items.map((item: any) => ({
            product: mapBackendProductToFrontend(item.product),
            quantity: Number(item.quantity),
            backendItemId: item.id
          }));
          setCartItems(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to add item to backend cart:', err);
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    const existing = cartItems.find(item => item.product.id === productId);
    if (!existing) return;
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const backendItemId = existing.backendItemId;
    if (!backendItemId) return;

    try {
      const response = await fetch(`/api/cart/items/${backendItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ quantity })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.cart && Array.isArray(data.cart.items)) {
          const mapped = data.cart.items.map((item: any) => ({
            product: mapBackendProductToFrontend(item.product),
            quantity: Number(item.quantity),
            backendItemId: item.id
          }));
          setCartItems(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to update cart item:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    const existing = cartItems.find(item => item.product.id === productId);
    if (!existing) return;

    const backendItemId = existing.backendItemId;
    if (!backendItemId) return;

    try {
      const response = await fetch(`/api/cart/items/${backendItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.cart && Array.isArray(data.cart.items)) {
          const mapped = data.cart.items.map((item: any) => ({
            product: mapBackendProductToFrontend(item.product),
            quantity: Number(item.quantity),
            backendItemId: item.id
          }));
          setCartItems(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // Calculated properties
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartShippingCost = cartSubtotal > 5000 ? 0 : (cartSubtotal === 0 ? 0 : 150); // Free shipping over 5000 INR
  const cartTotal = cartSubtotal + cartShippingCost;

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    if (!currentUser) {
      setPendingAction({ type: 'wishlist', productId, fromPage: currentPage });
      navigateTo('login');
      return;
    }
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Order Operations
  const placeOrder = async (address: ShippingAddress, paymentMethod: string): Promise<Order> => {
    try {
      // 1. Create the address in database
      const addrResponse = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          recipientName: address.fullName,
          phone: address.mobileNumber,
          line1: address.address,
          city: address.city,
          state: address.state,
          postalCode: address.pincode,
          country: 'India',
          isDefault: true
        })
      });

      if (!addrResponse.ok) {
        const err = await addrResponse.json();
        throw new Error(err.message || 'Failed to save shipping address');
      }

      const addrData = await addrResponse.json();
      const addressId = addrData.address.id;

      // 2. Call checkout
      const checkResponse = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ addressId })
      });

      if (!checkResponse.ok) {
        const err = await checkResponse.json();
        throw new Error(err.message || 'Failed to place order');
      }

      const orderData = await checkResponse.json();
      const o = orderData.order;

      // 3. Local Cart reset
      setCartItems([]);

      // 4. Map backend order response
      const items = (o.OrderItems || []).map((item: any) => ({
        productId: String(item.productId),
        name: item.Product?.title || 'Jewelry Item',
        price: Number(item.unitPrice) || 0,
        image: item.Product?.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
        quantity: Number(item.quantity) || 1
      }));
      const addr = o.Address || {};
      const newOrder: Order = {
        id: String(o.id || o.orderNumber),
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-IN'),
        items,
        shippingAddress: {
          fullName: addr.recipientName || 'Customer',
          mobileNumber: addr.phone || '',
          address: `${addr.line1 || ''} ${addr.line2 || ''}`.trim(),
          city: addr.city || '',
          state: addr.state || '',
          pincode: addr.postalCode || ''
        },
        paymentMethod: paymentMethod,
        paymentStatus: o.paymentStatus === 'SUCCESS' ? 'Success' : 'Processing',
        status: o.status === 'CONFIRMED' ? 'Confirmed' : o.status === 'PROCESSING' ? 'Processing' : o.status === 'SHIPPED' ? 'Shipped' : o.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : o.status === 'DELIVERED' ? 'Delivered' : o.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
        subtotal: Number(o.subtotal) || 0,
        shipping: Number(o.shippingCost) || 0,
        total: Number(o.total) || 0
      };

      setLatestOrder(newOrder);
      setOrders(prev => [newOrder, ...prev]);

      return newOrder;
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to place order');
      throw e;
    }
  };

  const updateOrderStatus = async (
    orderId: string, 
    status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled', 
    paymentStatus?: 'Success' | 'Processing' | 'Failed'
  ) => {
    try {
      const body: any = {};
      if (status) {
        body.status = status.toUpperCase().replace(/ /g, '_');
      }
      if (paymentStatus) {
        body.paymentStatus = paymentStatus === 'Success' ? 'SUCCESS' : 'PENDING';
      }

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          status: status || o.status,
          paymentStatus: paymentStatus || o.paymentStatus 
        } : o));
      } else {
        const err = await response.json();
        alert(`Failed to update order status: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error updating order status');
    }
  };

  const saveProfileAddress = (address: ShippingAddress) => {
    setProfile(prev => ({
      ...prev,
      savedAddresses: [...prev.savedAddresses, address]
    }));
  };

  const applyAuthSession = (payload: { token: string; user: { email: string; name: string; role?: string } }, successMessage: string) => {
    setAuthToken(payload.token);
    setCurrentUser(payload.user.email);
    const role = payload.user.role || 'CUSTOMER';
    setCurrentUserRole(role);
    setProfile(prev => ({
      ...prev,
      name: payload.user.name,
      email: payload.user.email,
    }));

    if (role === 'ADMIN') {
      setIsAdminViewState(true);
      setTimeout(() => {
        navigateTo('admin');
      }, 100);
    } else {
      setIsAdminViewState(false);
    }

    return { success: true, message: successMessage };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string; token: string; user: { email: string; name: string; role?: string } }>(
        '/api/auth/login',
        { email, password }
      );
      return applyAuthSession(response, response.message || 'Login successful');
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const startSignup = async (name: string, email: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string; expiresAt: string }>(
        '/api/auth/signup/start',
        { name, email }
      );
      return { success: true, message: response.message || 'OTP sent to email' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send OTP' };
    }
  };

  const verifySignupOtp = async (email: string, otp: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string; signupToken: string }>(
        '/api/auth/signup/verify',
        { email, otp }
      );
      return { success: true, message: response.message || 'OTP verified successfully', signupToken: response.signupToken };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to verify OTP' };
    }
  };

  const completeSignup = async (signupToken: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string; token: string; user: { email: string; name: string; role?: string } }>(
        '/api/auth/signup/complete',
        { signupToken, password }
      );
      return applyAuthSession(response, response.message || 'Account created successfully');
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to create account' };
    }
  };

  const googleSignIn = async (idToken: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string; token: string; user: { email: string; name: string; role?: string } }>(
        '/api/auth/google',
        { idToken }
      );
      return applyAuthSession(response, response.message || 'Google sign-in successful');
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Google sign-in failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentUserRole(null);
    setAuthToken(null);
    setIsAdminViewState(false);
    setPendingAction(null);
    setProfile({
      name: 'Aditi Sharma',
      email: 'aditi.sharma@gmail.com',
      mobile: '+91 98765 43210',
      savedAddresses: [
        {
          fullName: 'Aditi Sharma',
          mobileNumber: '9876543210',
          address: '402, Royal Residency, Linking Road, Santacruz West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400054'
        }
      ]
    });
    setCartItems([]);
    setWishlist([]);
    navigateTo('home');
  };

  return (
    <ShopContext.Provider value={{
      currentPage,
      selectedProductId,
      navigateTo,
      searchQuery,
      setSearchQuery,
      selectedCategoryFilter,
      setSelectedCategoryFilter,
      products,
      categories,
      addProduct,
      editProduct,
      deleteProduct,
      addReview,
      cartItems,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      cartShippingCost,
      cartTotal,
      wishlist,
      toggleWishlist,
      isInWishlist,
      orders,
      placeOrder,
      latestOrder,
      updateOrderStatus,
      profile,
      saveProfileAddress,
      isAdminView,
      setIsAdminView,
      activeAccountTab,
      setActiveAccountTab,
      currentUser,
      currentUserRole,
      pendingAction,
      setPendingAction,
      login,
      startSignup,
      verifySignupOtp,
      completeSignup,
      googleSignIn,
      logout
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
