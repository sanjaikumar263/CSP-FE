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

  /**
   * Check if a product or a specific color/size variant is wishlisted
   * @param {string} productId - Product ID
   * @param {string} [selectedColor] - Optional specific color to match
   * @param {string} [selectedSize] - Optional specific size to match
   */
  const isWishlisted = (productId, selectedColor, selectedSize) => {
    if (!productId) return false;
    const strId = String(productId);

    if (selectedColor || selectedSize) {
      return wishlist.some(item => {
        const idMatches = String(item.productId || item.id || item._id) === strId;
        const colorMatches = !selectedColor || !item.selectedColor ||
          item.selectedColor.toLowerCase() === selectedColor.toLowerCase();
        const sizeMatches = !selectedSize || !item.selectedSize ||
          item.selectedSize.toLowerCase() === selectedSize.toLowerCase();
        return idMatches && colorMatches && sizeMatches;
      });
    }

    return wishlist.some(item => String(item.productId || item.id || item._id) === strId);
  };

  /**
   * Toggle adding/removing a product variant from the wishlist
   * Supports both options object and positional arguments:
   * toggleWishlist(product, { selectedColor, selectedSize, image, colorCode, sku })
   * OR
   * toggleWishlist(product, selectedColor, selectedSize, image, colorCode, sku)
   */
  const toggleWishlist = (product, optionsOrColor = {}, optionalSize, optionalImage, optionalColorCode, optionalSku) => {
    if (!product) return;

    let selectedColor = '';
    let selectedSize = '';
    let image = '';
    let colorCode = '#0A305D';
    let sku = '';
    let stockQuantity = 99;

    if (typeof optionsOrColor === 'object' && optionsOrColor !== null && !Array.isArray(optionsOrColor)) {
      selectedColor = optionsOrColor.selectedColor || optionsOrColor.color || product.selectedColor || '';
      selectedSize = optionsOrColor.selectedSize || optionsOrColor.size || product.selectedSize || '';
      image = optionsOrColor.image || product.image || (Array.isArray(product.images) && product.images[0]) || '';
      colorCode = optionsOrColor.colorCode || product.colorCode || '#0A305D';
      sku = optionsOrColor.sku || product.sku || '';
      stockQuantity = optionsOrColor.stockQuantity ?? product.stockQuantity ?? 99;
    } else {
      selectedColor = typeof optionsOrColor === 'string' ? optionsOrColor : (product.selectedColor || '');
      selectedSize = typeof optionalSize === 'string' ? optionalSize : (product.selectedSize || '');
      image = optionalImage || product.image || (Array.isArray(product.images) && product.images[0]) || '';
      colorCode = optionalColorCode || product.colorCode || '#0A305D';
      sku = optionalSku || product.sku || '';
      stockQuantity = product.stockQuantity ?? 99;
    }

    const prodId = String(product.productId || product._id || product.id);
    const colorKey = selectedColor ? selectedColor.toLowerCase().replace(/\s+/g, '_') : 'default';
    const sizeKey = selectedSize ? selectedSize.toLowerCase().replace(/\s+/g, '_') : 'default';
    const compositeId = `${prodId}__c_${colorKey}__s_${sizeKey}`;

    setWishlist(prev => {
      // Check if this exact variant (or base product if no color/size) exists
      const existsIndex = prev.findIndex(item => {
        if (item.id === compositeId) return true;
        if (!selectedColor && !selectedSize && String(item.productId || item.id) === prodId) return true;
        return false;
      });

      if (existsIndex > -1) {
        // Toggle OFF (remove from wishlist)
        return prev.filter((_, idx) => idx !== existsIndex);
      } else {
        // Toggle ON (add to wishlist with exact details)
        let effectivePrice = 0;
        if (product.salePrice !== undefined && product.salePrice !== null && product.salePrice !== '') {
          effectivePrice = typeof product.salePrice === 'number' ? product.salePrice : parseFloat(String(product.salePrice).replace(/[^0-9.]/g, '')) || 0;
        } else if (product.price !== undefined && product.price !== null) {
          effectivePrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
        }

        let originalPrice = null;
        if (product.originalPrice !== undefined && product.originalPrice !== null) {
          originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, '')) || null;
        } else if (product.salePrice && product.price && product.price > effectivePrice) {
          originalPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || null;
        }

        const itemToSave = {
          id: compositeId,
          _id: compositeId,
          productId: prodId,
          name: product.name || product.title || 'Product',
          title: product.title || product.name || 'Product',
          price: effectivePrice,
          originalPrice: originalPrice,
          currency: product.currency || 'MYR',
          selectedColor: selectedColor,
          colorCode: colorCode,
          selectedSize: selectedSize,
          image: image || (Array.isArray(product.images) && product.images[0]) || '',
          category: product.category || '',
          sku: sku,
          isNew: Boolean(product.isNew),
          inStock: product.inStock !== false,
          stockQuantity: stockQuantity
        };

        return [itemToSave, ...prev];
      }
    });
  };

  /**
   * Remove a product or specific variant from wishlist
   * @param {string} id - Either composite ID or base product ID
   */
  const removeFromWishlist = (id) => {
    if (!id) return;
    const strId = String(id);
    setWishlist(prev => prev.filter(item =>
      item.id !== strId &&
      item._id !== strId &&
      (strId.includes('__') ? true : String(item.productId) !== strId)
    ));
  };

  /**
   * Clear entire wishlist
   */
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
