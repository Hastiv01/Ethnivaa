import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockProducts } from '../data/products';
import type { Product, Review } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
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
  placeOrder: (shippingAddress: ShippingAddress, paymentMethod: string) => Order;
  latestOrder: Order | null;
  updateOrderStatus: (orderId: string, status: Order['paymentStatus']) => void;

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

  // Load initial products from localStorage or use mockProducts
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

  const [isAdminView, setIsAdminViewState] = useState<boolean>(false);
  const [activeAccountTab, setActiveAccountTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');

  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return safeParse<string | null>('ethnivaa_current_user', null);
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return safeParse<string | null>('ethnivaa_auth_token', null);
  });

  const [pendingAction, setPendingAction] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ethnivaa_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ethnivaa_current_user');
    }
  }, [currentUser]);

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
        setCartItems(prev => {
          const existing = prev.find(item => item.product.id === pendingAction.product.id);
          if (existing) {
            return prev.map(item =>
              item.product.id === pendingAction.product.id
                ? { ...item, quantity: item.quantity + pendingAction.quantity }
                : item
            );
          }
          return [...prev, { product: pendingAction.product, quantity: pendingAction.quantity }];
        });
        if (fromPage) navigateTo(fromPage);
      } else if (type === 'wishlist') {
        setWishlist(prev =>
          prev.includes(pendingAction.productId)
            ? prev.filter(id => id !== pendingAction.productId)
            : [...prev, pendingAction.productId]
        );
        if (fromPage) navigateTo(fromPage);
      } else if (type === 'navigation') {
        navigateTo(pendingAction.page, pendingAction.productId);
      }
      setPendingAction(null);
    }
  }, [currentUser, pendingAction]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('ethnivaa_products_v2', JSON.stringify(products));
  }, [products]);

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
  const addProduct = (newProd: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'reviews'>) => {
    const id = `eth-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      rating: 5.0,
      reviewsCount: 0,
      reviews: []
    };
    setProducts(prev => [product, ...prev]);
  };

  const editProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
    // If details page is currently looking at this, check it
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (selectedProductId === id) {
      setSelectedProductId(null);
      setCurrentPage('shop');
    }
    // Also remove from cart
    setCartItems(prev => prev.filter(item => item.product.id !== id));
    // Also remove from wishlist
    setWishlist(prev => prev.filter(wishId => wishId !== id));
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

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      setPendingAction({ type: 'cart', product, quantity, fromPage: currentPage });
      navigateTo('login');
      return;
    }
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
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
  const placeOrder = (address: ShippingAddress, paymentMethod: string) => {
    const orderId = `ETH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0],
        quantity: item.quantity
      })),
      shippingAddress: address,
      paymentMethod,
      paymentStatus: 'Success',
      subtotal: cartSubtotal,
      shipping: cartShippingCost,
      total: cartTotal
    };

    setOrders(prev => [newOrder, ...prev]);
    setLatestOrder(newOrder);

    // Update stock levels
    setProducts(prev => prev.map(p => {
      const cartItem = cartItems.find(item => item.product.id === p.id);
      if (cartItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - cartItem.quantity)
        };
      }
      return p;
    }));

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['paymentStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
    if (latestOrder && latestOrder.id === orderId) {
      setLatestOrder(prev => prev ? { ...prev, paymentStatus: status } : null);
    }
  };

  const saveProfileAddress = (address: ShippingAddress) => {
    setProfile(prev => ({
      ...prev,
      savedAddresses: [...prev.savedAddresses, address]
    }));
  };

  const applyAuthSession = (payload: { token: string; user: { email: string; name: string } }, successMessage: string) => {
    setAuthToken(payload.token);
    setCurrentUser(payload.user.email);
    setProfile(prev => ({
      ...prev,
      name: payload.user.name,
      email: payload.user.email,
    }));
    return { success: true, message: successMessage };
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{ message: string; token: string; user: { email: string; name: string } }>(
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
      const response = await apiRequest<{ message: string; token: string; user: { email: string; name: string } }>(
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
      const response = await apiRequest<{ message: string; token: string; user: { email: string; name: string } }>(
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
    setAuthToken(null);
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
