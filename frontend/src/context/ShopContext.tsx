import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  resetToken?: string;
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
    color?: string;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: 'Success' | 'Failed';
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Returned by placeOrder() — includes everything the frontend needs
 * to open the real Razorpay Checkout popup.
 */
export interface PlaceOrderResult {
  order: Order;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;   // in paise (INR × 100)
  currency: string;
}

export type PageType = 'welcome' | 'home' | 'shop' | 'details' | 'cart' | 'checkout' | 'success' | 'failed' | 'account' | 'admin' | 'login' | 'signup' | 'terms' | 'privacy' | 'returns';

export interface BackendAddress {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface ShopContextType {
  // Routing State
  currentPage: PageType;
  selectedProductId: string | null;
  navigateTo: (page: PageType, productId?: string | null) => void;

  // Search & Filter state sharing
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  specialFilter: 'best-sellers' | 'new-arrivals' | null;
  setSpecialFilter: (filter: 'best-sellers' | 'new-arrivals' | null) => void;

  // Products state (supports Admin CRUD)
  products: Product[];

  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'reviews'>) => void;
  editProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, review: Omit<Review, 'id' | 'date' | 'verified'>) => void;

  // Cart State
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  buyNow: (product: Product, quantity?: number) => void;
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
  placeOrder: (shippingAddress: ShippingAddress, paymentMethod: string, saveAddress?: boolean) => Promise<PlaceOrderResult>;
  confirmPayment: (orderId: string, razorpayData: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) => Promise<void>;
  latestOrder: Order | null;
  updateOrderStatus: (orderId: string, status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled', paymentStatus?: 'Success' | 'Failed') => void;

  // Profile State
  profile: Profile;
  saveProfileAddress: (address: ShippingAddress) => void;

  // Backend Addresses (synced to DB)
  addresses: BackendAddress[];
  addAddress: (address: Omit<BackendAddress, 'id'>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  fetchAddresses: () => Promise<void>;

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
  startPasswordReset: (email: string) => Promise<AuthResult>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<AuthResult>;
  completePasswordReset: (resetToken: string, password: string) => Promise<AuthResult>;
  visitorCount: number;
  recordVisit: () => Promise<void>;
  isWakingUp: boolean;
  wakingProgress: number;
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
  // Navigation State — derived from URL, not useState
  const navigate = useNavigate();
  const location = useLocation();

  // Map URL path → PageType
  const pathToPage = (path: string): PageType => {
    if (path === '/' || path === '/welcome') return 'welcome';
    if (path === '/home') return 'home';
    if (path === '/shop') return 'shop';
    if (path.startsWith('/details')) return 'details';
    if (path === '/cart') return 'cart';
    if (path === '/checkout') return 'checkout';
    if (path === '/success') return 'success';
    if (path === '/failed') return 'failed';
    if (path === '/account') return 'account';
    if (path === '/admin') return 'admin';
    if (path === '/login') return 'login';
    if (path === '/signup') return 'signup';
    if (path === '/terms') return 'terms';
    if (path === '/privacy') return 'privacy';
    if (path === '/returns') return 'returns';
    return 'home';
  };

  // Map PageType → URL path
  const pageToPath = (page: PageType, productId?: string | null): string => {
    switch (page) {
      case 'welcome': return '/';
      case 'home': return '/home';
      case 'shop': return '/shop';
      case 'details': return productId ? `/details/${productId}` : '/shop';
      case 'cart': return '/cart';
      case 'checkout': return '/checkout';
      case 'success': return '/success';
      case 'failed': return '/failed';
      case 'account': return '/account';
      case 'admin': return '/admin';
      case 'login': return '/login';
      case 'signup': return '/signup';
      case 'terms': return '/terms';
      case 'privacy': return '/privacy';
      case 'returns': return '/returns';
      default: return '/home';
    }
  };

  // currentPage is always derived from the current URL
  const currentPage: PageType = pathToPage(location.pathname);


  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    // Extract product ID from URL on first load e.g. /details/123
    const match = window.location.pathname.match(/^\/details\/(.+)/);
    return match ? match[1] : null;
  });
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [specialFilter, setSpecialFilter] = useState<'best-sellers' | 'new-arrivals' | null>(null);



  // Load initial products (will be hydrated from backend on load)
  const [products, setProducts] = useState<Product[]>(() => {
    return safeParse('ethnivaa_products_v2', []);
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
      name: '',
      email: '',
      mobile: '',
      savedAddresses: []
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

  // Navigation controller — URL is the source of truth
  const navigateTo = (page: PageType, productId: string | null = null) => {
    if ((page === 'checkout' || page === 'account' || page === 'admin') && !currentUser) {
      setPendingAction({ type: 'navigation', page, productId, fromPage: currentPage });
      navigate('/login');
      return;
    }
    if (productId !== null) setSelectedProductId(productId);
    navigate(pageToPath(page, productId));
    window.scrollTo(0, 0);
  };

  // Backend-synced addresses state (separate from localStorage profile)
  const [addresses, setAddresses] = useState<BackendAddress[]>([]);

  // Visitor count state
  const [visitorCount, setVisitorCount] = useState<number>(0);

  // Server wake up states (Render cold start)
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [wakingProgress, setWakingProgress] = useState<number>(0);

  // On mount: fetch the current count (read-only, no increment)
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/visitors/count');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === 'number') {
            setVisitorCount(data.count);
          }
        }
      } catch (e) {
        console.error('Failed to fetch visitor count:', e);
      }
    };
    fetchCount();
  }, []);

  // Call this explicitly when a user intentionally enters the boutique
  const recordVisit = async () => {
    try {
      const res = await fetch('/api/visitors/ping', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') {
          setVisitorCount(data.count);
        }
      }
    } catch (e) {
      console.error('Failed to record visit:', e);
    }
  };

  // Helper mapper function
  const mapBackendProductToFrontend = (p: any): Product => {
    if (!p) {
      return {
        id: '',
        name: 'Deleted Product',
        price: 0,
        rating: 5.0,
        reviewsCount: 0,
        images: ['/placeholder.png'],
        description: 'This product is no longer available.',
        reviews: []
      };
    }

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
      images: imagesArr.length > 0 ? imagesArr : ['/placeholder.png'],
      description: p.description || '',
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

  const parseCartItems = (items: any[]): CartItem[] => {
    return (items || [])
      .filter((item: any) => item && item.product !== null && item.product !== undefined)
      .map((item: any) => ({
        product: mapBackendProductToFrontend(item.product),
        quantity: Number(item.quantity),
        backendItemId: item.id
      }));
  };

  // 1. Fetch categories and products from backend on load
  // Fetch profile from backend
  const fetchProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setProfile(prev => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
        }));
      } else {
        // Token is invalid or expired
        console.warn('Session verification failed, cleaning up credentials');
        setAuthToken(null);
        setCurrentUser(null);
        setCurrentUserRole(null);
        localStorage.removeItem('ethnivaa_auth_token');
        localStorage.removeItem('ethnivaa_current_user');
        localStorage.removeItem('ethnivaa_current_user_role');
        
        alert('Your session has expired. Please log in again.');
        
        // If on a protected route, redirect to login
        const path = window.location.pathname;
        if (path === '/checkout' || path === '/account' || path === '/admin') {
          navigateTo('login');
        }
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    }
  }, [navigateTo]);

  // 1. Fetch categories and products from backend on load
  const PRODUCTS_CACHE_KEY = 'ethnivaa_products_cache';
  const PRODUCTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const loadBackendData = async () => {
    let wakeTimer: any = null;
    let progressInterval: any = null;

    try {
      // Check product cache before fetching
      const cacheRaw = localStorage.getItem(PRODUCTS_CACHE_KEY);
      if (cacheRaw) {
        try {
          const cache = JSON.parse(cacheRaw);
          if (cache.ts && Date.now() - cache.ts < PRODUCTS_CACHE_TTL && Array.isArray(cache.data)) {
            setProducts(cache.data);
            return; // Cache hit — skip network request
          }
        } catch (_) { /* ignore corrupt cache */ }
      }

      // Start wake up timer if network request is made
      wakeTimer = setTimeout(() => {
        setIsWakingUp(true);
        progressInterval = setInterval(() => {
          setWakingProgress(prev => {
            if (prev >= 99) return 99;
            return prev + 1;
          });
        }, 500); // 500ms * 100 = 50 seconds
      }, 1200);

      // Cache miss — fetch fresh products
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData.products)) {
          const mapped = prodData.products.map(mapBackendProductToFrontend);
          setProducts(mapped);
          // Store in cache with timestamp
          localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: mapped }));
        }
      }
    } catch (e) {
      console.error('Failed to load initial data from backend:', e);
    } finally {
      if (wakeTimer) clearTimeout(wakeTimer);
      if (progressInterval) clearInterval(progressInterval);
      setWakingProgress(100);
      
      // Delay closing the overlay so user sees 100% completion
      setTimeout(() => {
        setIsWakingUp(false);
      }, 600);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Fetch profile on mount if token exists
  useEffect(() => {
    const storedToken = safeParse<string | null>('ethnivaa_auth_token', null);
    if (storedToken) {
      fetchProfile(storedToken);
    }
  }, [fetchProfile]);

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
              name: item.Product?.title || 'Jewellery Item',
              price: Number(item.unitPrice) || 0,
              image: item.Product?.image || '/placeholder.png',
              quantity: Number(item.quantity) || 1,
              color: item.Product?.color || ''
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
              paymentStatus: o.paymentStatus === 'SUCCESS' ? 'Success' : 'Failed',
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
            setCartItems(parseCartItems(data.cart.items));
          }
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCart();
  }, [currentUser, authToken]);

  // 4. Load backend addresses when logged in
  const fetchAddresses = useCallback(async () => {
    const token = safeParse<string | null>('ethnivaa_auth_token', null);
    if (!token) return;
    try {
      const res = await fetch('/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser && authToken) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [currentUser, authToken, fetchAddresses]);

  const addAddress = async (address: Omit<BackendAddress, 'id'>) => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          label: address.label || 'Shipping Address',
          recipientName: address.recipientName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 || null,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country || 'India',
          isDefault: address.isDefault || false,
        })
      });
      if (res.ok) {
        await fetchAddresses();
      } else {
        const err = await res.json();
        alert(`Failed to save address: ${err.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to add address:', err);
      alert('Error saving address');
    }
  };

  const deleteAddress = async (id: number) => {
    if (!authToken) {
      setAddresses(prev => prev.filter(a => a.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== id));
      } else {
        const err = await res.json();
        alert(`Failed to delete address: ${err.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

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
      } else if (type === 'buyNow') {
        (async () => {
          const success = await addToCart(pendingAction.product, pendingAction.quantity);
          if (success) {
            navigateTo('checkout');
          }
        })();
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
          images: newProd.images,
          isBestSeller: newProd.isBestSeller,
          isNewArrival: newProd.isNewArrival
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.product) {
          const mapped = mapBackendProductToFrontend(data.product);
          setProducts(prev => [mapped, ...prev]);
          localStorage.removeItem(PRODUCTS_CACHE_KEY);
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
      const body: any = {};
      if (updatedFields.name !== undefined) body.title = updatedFields.name;
      if (updatedFields.description !== undefined) body.description = updatedFields.description;
      if (updatedFields.price !== undefined) body.price = updatedFields.price;
      if (updatedFields.originalPrice !== undefined) body.originalPrice = updatedFields.originalPrice;
      if (updatedFields.images !== undefined) body.images = updatedFields.images;
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
          localStorage.removeItem(PRODUCTS_CACHE_KEY);
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
        navigate('/shop');
      }
      setCartItems(prev => prev.filter(item => item.product?.id !== id));
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
          navigate('/shop');
        }
        setCartItems(prev => prev.filter(item => item.product?.id !== id));
        setWishlist(prev => prev.filter(wishId => wishId !== id));
        localStorage.removeItem(PRODUCTS_CACHE_KEY);
      } else {
        const err = await response.json();
        alert(`Failed to delete product: ${err.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting product');
    }
  };

  const addReview = async (productId: string, newReview: Omit<Review, 'id' | 'date' | 'verified'>) => {
    // Optimistically update local state first
    const localReview: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedReviews = [localReview, ...p.reviews];
        const avgRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1));
        return { ...p, reviews: updatedReviews, reviewsCount: updatedReviews.length, rating: avgRating };
      }
      return p;
    }));

    // Then persist to backend
    if (!authToken) return;
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          productId: Number(productId),
          rating: newReview.rating,
          comment: newReview.comment,
        })
      });
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
    } catch (err) {
      console.error('Failed to save review to backend:', err);
    }
  };

  // Cart operations (backend synced, optimistic updates)
  const addToCart = async (product: Product, quantity: number = 1): Promise<boolean> => {
    if (!currentUser) {
      setPendingAction({ type: 'cart', product, quantity, fromPage: currentPage });
      navigateTo('login');
      return false;
    }

    // --- OPTIMISTIC UPDATE: update UI immediately ---
    setCartItems(prev => {
      const existing = prev.find(item => item.product?.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product?.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

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
          // Sync with server-confirmed state
          setCartItems(parseCartItems(data.cart.items));
        }
        return true;
      } else {
        // Rollback on server failure
        setCartItems(prev => {
          const existing = prev.find(item => item.product?.id === product.id);
          if (existing && existing.quantity > quantity) {
            return prev.map(item =>
              item.product?.id === product.id
                ? { ...item, quantity: item.quantity - quantity }
                : item
            );
          }
          return prev.filter(item => item.product?.id !== product.id);
        });
        console.error('Failed to add item to backend cart');
        return false;
      }
    } catch (err) {
      // Rollback on network error
      setCartItems(prev => {
        const existing = prev.find(item => item.product?.id === product.id);
        if (existing && existing.quantity > quantity) {
          return prev.map(item =>
            item.product?.id === product.id
              ? { ...item, quantity: item.quantity - quantity }
              : item
          );
        }
        return prev.filter(item => item.product?.id !== product.id);
      });
      console.error('Failed to add item to backend cart:', err);
      return false;
    }
  };

  const buyNow = async (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      setPendingAction({ type: 'buyNow', product, quantity });
      navigateTo('login');
      return;
    }
    const success = await addToCart(product, quantity);
    if (success) {
      navigateTo('checkout');
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    const existing = cartItems.find(item => item.product?.id === productId);
    if (!existing) return;
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const backendItemId = existing.backendItemId;
    if (!backendItemId) return;

    // --- OPTIMISTIC UPDATE ---
    const previousQuantity = existing.quantity;
    setCartItems(prev =>
      prev.map(item =>
        item.product?.id === productId ? { ...item, quantity } : item
      )
    );

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
          setCartItems(parseCartItems(data.cart.items));
        }
      } else {
        // Rollback
        setCartItems(prev =>
          prev.map(item =>
            item.product?.id === productId ? { ...item, quantity: previousQuantity } : item
          )
        );
      }
    } catch (err) {
      // Rollback
      setCartItems(prev =>
        prev.map(item =>
          item.product?.id === productId ? { ...item, quantity: previousQuantity } : item
        )
      );
      console.error('Failed to update cart item:', err);
    }
  };

  const removeFromCart = async (productId: string) => {
    const existing = cartItems.find(item => item.product?.id === productId);
    if (!existing) return;

    const backendItemId = existing.backendItemId;
    if (!backendItemId) return;

    // --- OPTIMISTIC UPDATE ---
    const removedItem = existing;
    setCartItems(prev => prev.filter(item => item.product?.id !== productId));

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
          setCartItems(parseCartItems(data.cart.items));
        }
      } else {
        // Rollback — re-insert the removed item
        setCartItems(prev => [...prev, removedItem]);
      }
    } catch (err) {
      // Rollback
      setCartItems(prev => [...prev, removedItem]);
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
  const cartSubtotal = cartItems.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0);
  const cartShippingCost = cartSubtotal >= 699 ? 0 : (cartSubtotal === 0 ? 0 : 80); // Free shipping over 699 INR
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
  const placeOrder = async (address: ShippingAddress, paymentMethod: string, saveAddress?: boolean): Promise<PlaceOrderResult> => {
    try {
      // Single API call — sends address inline, no separate address creation step
      const checkResponse = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          address: {
            recipientName: address.fullName,
            phone: address.mobileNumber,
            line1: address.address,
            city: address.city,
            state: address.state,
            postalCode: address.pincode,
            country: 'India',
          },
          paymentMethod,
          saveAddress,
        })
      });

      if (!checkResponse.ok) {
        const err = await checkResponse.json();
        throw new Error(err.message || 'Failed to place order');
      }

      const responseData = await checkResponse.json();
      const o = responseData.order;

      // Map backend order response
      const items = (o.OrderItems || []).map((item: any) => ({
        productId: String(item.productId),
        name: item.Product?.title || 'Jewellery Item',
        price: Number(item.unitPrice) || 0,
        image: item.Product?.image || '/placeholder.png',
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
        paymentStatus: o.paymentStatus === 'SUCCESS' ? 'Success' : 'Failed',
        status: o.status === 'CONFIRMED' ? 'Confirmed' : o.status === 'PROCESSING' ? 'Processing' : o.status === 'SHIPPED' ? 'Shipped' : o.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : o.status === 'DELIVERED' ? 'Delivered' : o.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
        subtotal: Number(o.subtotal) || 0,
        shipping: Number(o.shippingCost) || 0,
        total: Number(o.total) || 0
      };

      setLatestOrder(newOrder);
      setOrders(prev => [newOrder, ...prev]);

      // Return order + Razorpay fields needed to open the real Razorpay Checkout popup
      return {
        order: newOrder,
        razorpayOrderId: responseData.razorpayOrderId,
        razorpayKeyId: responseData.razorpayKeyId,
        amount: responseData.amount,
        currency: responseData.currency || 'INR',
      };
    } catch (e: any) {
      console.error(e);
      throw e; // let caller (Checkout.tsx) handle the error display
    }
  };

  /**
   * confirmPayment — called inside the Razorpay success handler.
   * Sends the three Razorpay-provided verification fields to the backend
   * for HMAC-SHA256 signature verification. Rejects forged confirmations.
   */
  const confirmPayment = async (
    orderId: string,
    razorpayData: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }
  ): Promise<void> => {
    if (!authToken) throw new Error('Not authenticated');
    const response = await fetch(`/api/orders/${orderId}/confirm-payment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(razorpayData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Payment verification failed');
    }
    // Update local order state to reflect confirmed payment
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, paymentStatus: 'Success', status: 'Confirmed' }
          : o
      )
    );
    setLatestOrder(prev =>
      prev?.id === orderId
        ? { ...prev, paymentStatus: 'Success', status: 'Confirmed' }
        : prev
    );

    // Clear local cart items upon successful payment confirmation
    setCartItems([]);

    // Clear pending order info from localStorage on successful payment
    localStorage.removeItem('ethnivaa_pending_order_id');
    localStorage.removeItem('ethnivaa_rzp_options');
  };

  const updateOrderStatus = async (
    orderId: string, 
    status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled', 
    paymentStatus?: 'Success' | 'Failed'
  ) => {
    try {
      const body: any = {};
      if (status) {
        body.status = status.toUpperCase().replace(/ /g, '_');
      }
      if (paymentStatus) {
        body.paymentStatus = paymentStatus === 'Success' ? 'SUCCESS' : 'FAILED';
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
    // Keep local profile savedAddresses in sync for Checkout autofill
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
    setAddresses([]);
    setOrders([]);
    setCartItems([]);
    setWishlist([]);
    setProfile({
      name: '',
      email: '',
      mobile: '',
      savedAddresses: []
    });
    localStorage.removeItem('ethnivaa_pending_order_id');
    localStorage.removeItem('ethnivaa_rzp_options');
    navigateTo('home');
  };

  const startPasswordReset = async (email: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string }>(
        '/api/auth/forgot-password/start',
        { email }
      );
      return { success: true, message: response.message || 'OTP sent to email' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to send OTP' };
    }
  };

  const verifyPasswordResetOtp = async (email: string, otp: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string; resetToken: string }>(
        '/api/auth/forgot-password/verify',
        { email, otp }
      );
      return { success: true, message: response.message || 'OTP verified successfully', resetToken: response.resetToken };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to verify OTP' };
    }
  };

  const completePasswordReset = async (resetToken: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string }>(
        '/api/auth/forgot-password/complete',
        { resetToken, password }
      );
      return { success: true, message: response.message || 'Password reset successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to reset password' };
    }
  };

  return (
    <ShopContext.Provider value={{
      currentPage,
      selectedProductId,
      navigateTo,
      searchQuery,
      setSearchQuery,
      specialFilter,
      setSpecialFilter,
      products,
      addProduct,
      editProduct,
      deleteProduct,
      addReview,
      cartItems,
      addToCart,
      buyNow,
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
      confirmPayment,
      latestOrder,
      updateOrderStatus,
      profile,
      saveProfileAddress,
      addresses,
      addAddress,
      deleteAddress,
      fetchAddresses,
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
      logout,
      startPasswordReset,
      verifyPasswordResetOtp,
      completePasswordReset,
      visitorCount,
      recordVisit,
      isWakingUp,
      wakingProgress
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
