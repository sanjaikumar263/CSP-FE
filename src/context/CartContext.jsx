import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'csp_cart_items';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  // Open & Close drawer helpers
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  /**
   * Add a product variant to cart
   * @param {Object} product - Base product object
   * @param {Object|string} optionsOrColor - Options object or color string
   * @param {string} [optionalSize] - Size string if using positional args
   * @param {number} [optionalQty] - Quantity number if using positional args
   * @param {string} [optionalImage] - Image URL if using positional args
   */
  const addToCart = (product, optionsOrColor = {}, optionalSize, optionalQty = 1, optionalImage, optionalColorCode, optionalSku) => {
    if (!product) return;

    // Support both options object and positional arguments
    let selectedColor = '';
    let selectedSize = '';
    let quantity = 1;
    let image = '';
    let colorCode = '#0A305D';
    let sku = '';
    let stockQuantity = 99;

    if (typeof optionsOrColor === 'object' && optionsOrColor !== null && !Array.isArray(optionsOrColor)) {
      selectedColor = optionsOrColor.selectedColor || optionsOrColor.color || product.selectedColor || '';
      selectedSize = optionsOrColor.selectedSize || optionsOrColor.size || product.selectedSize || '';
      quantity = Math.max(1, parseInt(optionsOrColor.quantity, 10) || 1);
      image = optionsOrColor.image || product.image || (Array.isArray(product.images) && product.images[0]) || '';
      colorCode = optionsOrColor.colorCode || product.colorCode || '#0A305D';
      sku = optionsOrColor.sku || product.sku || '';
      stockQuantity = optionsOrColor.stockQuantity ?? product.stockQuantity ?? 99;
    } else {
      selectedColor = typeof optionsOrColor === 'string' ? optionsOrColor : '';
      selectedSize = typeof optionalSize === 'string' ? optionalSize : '';
      quantity = Math.max(1, parseInt(optionalQty, 10) || 1);
      image = optionalImage || product.image || (Array.isArray(product.images) && product.images[0]) || '';
      colorCode = optionalColorCode || product.colorCode || '#0A305D';
      sku = optionalSku || product.sku || '';
      stockQuantity = product.stockQuantity ?? 99;
    }

    const prodId = String(product.productId || product._id || product.id);
    const colorKey = selectedColor ? selectedColor.toLowerCase().replace(/\s+/g, '_') : 'default';
    const sizeKey = selectedSize ? selectedSize.toLowerCase().replace(/\s+/g, '_') : 'default';
    const compositeId = `${prodId}__c_${colorKey}__s_${sizeKey}`;

    // Calculate effective price
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

    const newItem = {
      id: compositeId,
      productId: prodId,
      title: product.title || product.name || 'Exquisite Silk Product',
      name: product.name || product.title || 'Exquisite Silk Product',
      price: effectivePrice,
      originalPrice: originalPrice,
      currency: product.currency || 'MYR',
      selectedColor: selectedColor,
      colorCode: colorCode,
      selectedSize: selectedSize,
      image: image,
      sku: sku,
      stockQuantity: stockQuantity,
      category: product.category || '',
      quantity: quantity
    };

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === compositeId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity || 1;
        const newTotalQty = Math.min(stockQuantity, currentQty + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newTotalQty,
          image: image || updated[existingIndex].image, // refresh image if provided
          stockQuantity: stockQuantity
        };
        return updated;
      } else {
        return [newItem, ...prevCart];
      }
    });

    setLastAddedItem(newItem);
    setIsCartOpen(true);
  };

  /**
   * Update quantity of an item in cart
   */
  const updateQuantity = (itemId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const maxStock = item.stockQuantity || 99;
          return {
            ...item,
            quantity: Math.min(maxStock, Math.max(1, qty))
          };
        }
        return item;
      })
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  /**
   * Clear all items in cart
   */
  const clearCart = () => {
    setCart([]);
  };

  // Cart total count (sum of all quantities)
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Cart subtotal
  const cartSubtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        lastAddedItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
