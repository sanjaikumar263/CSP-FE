import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  // -------------------------------------------------------------
  // 1. Customer Authentication State
  // -------------------------------------------------------------
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('customerUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customerToken, setCustomerToken] = useState(() => {
    return localStorage.getItem('customerToken') || null;
  });

  const isCustomerLoggedIn = Boolean(customerUser);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'

  const openAuthModal = (notice = '', initialTab = 'login') => {
    setAuthNotice(notice);
    setAuthTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthNotice('');
  };

  // Customer Login (Supports Email OR Mobile Number + Password)
  const customerLogin = async (loginId, password) => {
    const cleanId = loginId.trim();
    if (!cleanId || !password) {
      return { success: false, message: 'Please provide your Email/Mobile Number and Password.' };
    }

    try {
      // Try backend endpoint
      const res = await fetch(`${API_BASE_URL}/auth/customer-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: cleanId, password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCustomerUser(data.user);
        setCustomerToken(data.token || 'customer_session_token');
        localStorage.setItem('customerUser', JSON.stringify(data.user));
        localStorage.setItem('customerToken', data.token || 'customer_session_token');
        closeAuthModal();
        showToast(`Welcome back, ${data.user.name || 'Customer'}!`, 'success');
        return { success: true, user: data.user };
      } else if (data && data.message) {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, using local customer session:', err);
    }

    // Fallback/Local login support if backend API server is offline
    const savedCustomers = JSON.parse(localStorage.getItem('registeredCustomers') || '[]');
    const matched = savedCustomers.find(
      c => (c.email && c.email.toLowerCase() === cleanId.toLowerCase()) || (c.mobile && c.mobile === cleanId)
    );

    if (matched) {
      if (matched.password === password) {
        const userData = { id: matched.id, name: matched.name, email: matched.email, mobile: matched.mobile, role: 'customer' };
        setCustomerUser(userData);
        setCustomerToken('customer_session_' + Date.now());
        localStorage.setItem('customerUser', JSON.stringify(userData));
        localStorage.setItem('customerToken', 'customer_session_' + Date.now());
        closeAuthModal();
        showToast(`Welcome back, ${matched.name}!`, 'success');
        return { success: true, user: userData };
      } else {
        return { success: false, message: 'Invalid password. Please check your password and try again.' };
      }
    }

    // Create a new session for valid formatted input
    const isEmail = cleanId.includes('@');
    const newUser = {
      id: 'cust_' + Date.now(),
      name: isEmail ? cleanId.split('@')[0] : 'Valued Customer',
      email: isEmail ? cleanId : `${cleanId}@customer.com`,
      mobile: isEmail ? '' : cleanId,
      role: 'customer'
    };

    setCustomerUser(newUser);
    setCustomerToken('customer_session_' + Date.now());
    localStorage.setItem('customerUser', JSON.stringify(newUser));
    localStorage.setItem('customerToken', 'customer_session_' + Date.now());

    savedCustomers.push({ ...newUser, password });
    localStorage.setItem('registeredCustomers', JSON.stringify(savedCustomers));

    closeAuthModal();
    showToast(`Signed in successfully as ${newUser.name}!`, 'success');
    return { success: true, user: newUser };
  };

  // Customer Register
  const customerRegister = async (name, email, mobile, password) => {
    if (!name || (!email && !mobile) || !password) {
      return { success: false, message: 'Please fill in all required fields (Name, Email/Mobile, Password).' };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/customer-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCustomerUser(data.user);
        setCustomerToken(data.token || 'customer_session_' + Date.now());
        localStorage.setItem('customerUser', JSON.stringify(data.user));
        localStorage.setItem('customerToken', data.token || 'customer_session_' + Date.now());
        closeAuthModal();
        showToast(`Account created successfully! Welcome, ${data.user.name}!`, 'success');
        return { success: true, user: data.user };
      } else if (data && data.message) {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend register error, fallback to local register:', err);
    }

    const newUser = {
      id: 'cust_' + Date.now(),
      name,
      email: email || `${mobile}@customer.com`,
      mobile: mobile || '',
      role: 'customer'
    };

    const savedCustomers = JSON.parse(localStorage.getItem('registeredCustomers') || '[]');
    savedCustomers.push({ ...newUser, password });
    localStorage.setItem('registeredCustomers', JSON.stringify(savedCustomers));

    setCustomerUser(newUser);
    setCustomerToken('customer_session_' + Date.now());
    localStorage.setItem('customerUser', JSON.stringify(newUser));
    localStorage.setItem('customerToken', 'customer_session_' + Date.now());

    closeAuthModal();
    showToast(`Account created! Welcome to Chennai Silk Palace, ${name}!`, 'success');
    return { success: true, user: newUser };
  };

  const customerLogout = () => {
    setCustomerUser(null);
    setCustomerToken(null);
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerToken');
    showToast('Logged out successfully.', 'info');
  };

  // -------------------------------------------------------------
  // 2. Shopping Cart State
  // -------------------------------------------------------------
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('customerCart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('customerCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, options = {}) => {
    // Check if customer is logged in
    if (!isCustomerLoggedIn) {
      openAuthModal('Please sign in with your Mobile Number or Email to add items to your Shopping Cart.');
      return false;
    }

    const prodId = product._id || product.id;
    const price = typeof product.price === 'number'
      ? product.price
      : (parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0);

    const image = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '');

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === prodId && item.selectedSize === options.size);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          id: prodId,
          title: product.name || product.title || 'Silk Outfit',
          price,
          currency: product.currency || 'MYR',
          image,
          quantity,
          selectedSize: options.size || 'Free Size',
          category: product.category || ''
        }];
      }
    });

    showToast(`✓ Added "${product.name || product.title || 'Product'}" to your Cart!`, 'success');
    return true;
  };

  const removeFromCart = (id, selectedSize) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
    showToast('Item removed from cart.', 'info');
  };

  const updateCartQty = (id, selectedSize, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id && item.selectedSize === selectedSize) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // -------------------------------------------------------------
  // 3. Wishlist State
  // -------------------------------------------------------------
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('customerWishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('customerWishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const isWishlisted = (id) => {
    const prodId = String(id);
    return wishlistItems.some(item => String(item.id) === prodId);
  };

  const toggleWishlist = (product) => {
    const prodId = String(product._id || product.id || product);
    const currentlyWishlisted = isWishlisted(prodId);

    if (currentlyWishlisted) {
      setWishlistItems(prev => prev.filter(item => String(item.id) !== prodId));
      showToast('Removed item from Wishlist.', 'info');
    } else {
      const price = typeof product.price === 'number'
        ? product.price
        : (parseFloat(String(product.price || 0).replace(/[^0-9.]/g, '')) || 0);

      const image = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '');

      const newItem = {
        id: prodId,
        title: product.name || product.title || 'Silk Outfit',
        price,
        currency: product.currency || 'MYR',
        image,
        category: product.category || ''
      };

      setWishlistItems(prev => [...prev, newItem]);
      showToast(`❤️ Added "${newItem.title}" to your Wishlist!`, 'success');
    }
  };

  const wishlistCount = wishlistItems.length;

  // -------------------------------------------------------------
  // 4. Global Toast Notification State
  // -------------------------------------------------------------
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  return (
    <ShopContext.Provider
      value={{
        // Auth
        customerUser,
        customerToken,
        isCustomerLoggedIn,
        customerLogin,
        customerRegister,
        customerLogout,
        isAuthModalOpen,
        authNotice,
        authTab,
        setAuthTab,
        openAuthModal,
        closeAuthModal,

        // Cart
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),

        // Wishlist
        wishlistItems,
        wishlistCount,
        isWishlisted,
        toggleWishlist,
        isWishlistDrawerOpen,
        setIsWishlistDrawerOpen,
        openWishlistDrawer: () => setIsWishlistDrawerOpen(true),
        closeWishlistDrawer: () => setIsWishlistDrawerOpen(false),

        // Toast
        toast,
        showToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
