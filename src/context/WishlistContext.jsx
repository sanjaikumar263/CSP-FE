import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'csp_wishlist_items';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading wishlist from localStorage:', e);
      return [];
    }
  });

  // Keep localStorage updated whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlist]);

  // Check if a product ID is wishlisted
  const isWishlisted = (productId) => {
    if (!productId) return false;
    const strId = String(productId);
    return wishlist.some(item => String(item.id || item._id) === strId);
  };

  // Toggle adding/removing a product
  const toggleWishlist = (product) => {
    if (!product) return;
    const prodId = String(product.id || product._id);

    setWishlist(prev => {
      const exists = prev.some(item => String(item.id || item._id) === prodId);
      if (exists) {
        return prev.filter(item => String(item.id || item._id) !== prodId);
      } else {
        const itemToSave = {
          id: prodId,
          _id: prodId,
          name: product.name || product.title || 'Product',
          title: product.title || product.name || 'Product',
          price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
          originalPrice: product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(product.originalPrice)) : null,
          currency: product.currency || 'MYR',
          image: product.image || (Array.isArray(product.images) && product.images[0]) || '',
          category: product.category || '',
          isNew: Boolean(product.isNew),
          inStock: product.inStock !== false,
          stockQuantity: product.stockQuantity || 0
        };
        return [itemToSave, ...prev];
      }
    });
  };

  // Remove a product by ID
  const removeFromWishlist = (productId) => {
    if (!productId) return;
    const strId = String(productId);
    setWishlist(prev => prev.filter(item => String(item.id || item._id) !== strId));
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlist([]);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
