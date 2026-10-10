/**
 * priceUtils.js - Unified Price & Offer Calculation Utility for Clothing Shop
 * 
 * Rules for Product Cards:
 * 1. If product has an active Offer/Sale Price (`salePrice` < `price`):
 *    - Main Price (`priceDisplay`) = Offer Price (e.g. "155.00")
 *    - Struck-through Price (`originalPriceDisplay`) = Regular Price (e.g. "200.00")
 *    - `hasOffer` = true
 *    - `discountPercentage` = e.g. 23 (for 23% OFF)
 * 
 * 2. If product has `originalPrice` > `price` (e.g. mock items):
 *    - Main Price (`priceDisplay`) = Current Price (e.g. "170.00")
 *    - Struck-through Price (`originalPriceDisplay`) = Original Price (e.g. "220.00")
 *    - `hasOffer` = true
 *    - `discountPercentage` = e.g. 23
 * 
 * 3. Standard Product (No Offer Price):
 *    - Main Price (`priceDisplay`) = Regular Base Price (e.g. "500.00")
 *    - Struck-through Price = null
 *    - `hasOffer` = false
 *    - `discountPercentage` = null
 */

export function parsePriceNumber(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const clean = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

export function formatPriceDisplay(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  return Number(amount).toFixed(2);
}

/**
 * Returns complete price details for any product or catalog card item:
 * @param {Object} product
 * @returns {{
 *   price: number,
 *   currentPrice: number,
 *   salePrice: number | null,
 *   originalPrice: number | null,
 *   priceDisplay: string,
 *   originalPriceDisplay: string | null,
 *   hasOffer: boolean,
 *   discountPercentage: number | null,
 *   currency: string
 * }}
 */
export function getProductPriceInfo(product) {
  if (!product) {
    return {
      price: 0,
      currentPrice: 0,
      salePrice: null,
      originalPrice: null,
      priceDisplay: '0.00',
      originalPriceDisplay: null,
      hasOffer: false,
      discountPercentage: null,
      currency: 'MYR'
    };
  }

  const currency = product.currency || 'MYR';

  const baseRegular = parsePriceNumber(product.price);
  const baseSale = parsePriceNumber(product.salePrice);
  const baseOriginal = parsePriceNumber(product.originalPrice);

  // Case 1: Product has base salePrice (Offer Price)
  if (baseSale !== null && baseSale > 0 && baseRegular !== null && baseSale < baseRegular) {
    const discountPct = Math.round(((baseRegular - baseSale) / baseRegular) * 100);
    return {
      price: baseSale,
      currentPrice: baseSale,
      salePrice: baseSale,
      originalPrice: baseRegular,
      priceDisplay: baseSale.toFixed(2),
      originalPriceDisplay: baseRegular.toFixed(2),
      hasOffer: true,
      discountPercentage: discountPct,
      currency
    };
  }

  // Case 2: Product has originalPrice > price (e.g. mock sample items where price=offer, originalPrice=regular)
  if (baseOriginal !== null && baseOriginal > 0 && baseRegular !== null && baseOriginal > baseRegular) {
    const discountPct = Math.round(((baseOriginal - baseRegular) / baseOriginal) * 100);
    return {
      price: baseRegular,
      currentPrice: baseRegular,
      salePrice: baseRegular,
      originalPrice: baseOriginal,
      priceDisplay: baseRegular.toFixed(2),
      originalPriceDisplay: baseOriginal.toFixed(2),
      hasOffer: true,
      discountPercentage: discountPct,
      currency
    };
  }

  // Case 3: Standard regular price (No Offer)
  const regularPrice = baseRegular !== null ? baseRegular : 0;
  return {
    price: regularPrice,
    currentPrice: regularPrice,
    salePrice: null,
    originalPrice: null,
    priceDisplay: regularPrice.toFixed(2),
    originalPriceDisplay: null,
    hasOffer: false,
    discountPercentage: null,
    currency
  };
}
