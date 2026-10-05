import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { API_BASE_URL } from '../config';
import { compressImage } from '../utils/imageCompressor';
import { getDepartmentHierarchy, findCategoryHierarchy } from '../data/categoriesData';
import SizeChartEditor from '../components/SizeChartEditor';
import { DEFAULT_SIZE_CHART, syncSizeChartWithSizes } from '../data/sizeChartPresets';
import './ProductAddPage.css';

let nextId = 100;

const PRESET_COLORS = [
  { name: 'Navy Blue', code: '#0A305D' },
  { name: 'Maroon', code: '#800000' },
  { name: 'Crimson Red', code: '#DC2626' },
  { name: 'Royal Blue', code: '#1D4ED8' },
  { name: 'Emerald Green', code: '#059669' },
  { name: 'Mustard Gold', code: '#D97706' },
  { name: 'Rose Pink', code: '#DB2777' },
  { name: 'Royal Purple', code: '#7C3AED' },
  { name: 'Classic Black', code: '#18181B' },
  { name: 'Pure White', code: '#FFFFFF' },
  { name: 'Cream / Beige', code: '#F5F5DC' },
  { name: 'Teal', code: '#0D9488' },
  { name: 'Olive Green', code: '#556B2F' },
  { name: 'Wine / Burgundy', code: '#722F37' },
  { name: 'Sunset Orange', code: '#EA580C' },
  { name: 'Lavender', code: '#A855F7' },
  { name: 'Peacock Blue', code: '#005F73' },
  { name: 'Coral Pink', code: '#F43F5E' },
  { name: 'Magenta', code: '#C026D3' },
  { name: 'Copper Rust', code: '#B45309' }
];

const PRESET_SIZES = [
  'Free Size', 'Unstitched', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL',
  '32', '34', '36', '38', '40', '42', '44', '46'
];

const SIZE_BUNDLES = [
  { label: 'Saree / Shawl', items: ['Free Size', 'Unstitched'] },
  { label: 'Standard Apparel (S - 2XL)', items: ['S', 'M', 'L', 'XL', '2XL'] },
  { label: 'Plus Sizes (3XL - 5XL)', items: ['3XL', '4XL', '5XL'] },
  { label: 'Kurta / Blouse (36 - 44)', items: ['36', '38', '40', '42', '44'] }
];

function generateVariantList(currentColors, currentSizes, existingVariants = [], baseSku = '') {
  if (currentColors.length === 0 && currentSizes.length === 0) {
    return [];
  }

  const cleanBaseSku = (baseSku || 'CSP').trim();
  const results = [];

  // Case 1: Colors exist, no sizes selected (e.g. Sarees or Shawls with Free Size)
  if (currentColors.length > 0 && currentSizes.length === 0) {
    currentColors.forEach(c => {
      const match = existingVariants.find(
        v => v.color?.toLowerCase() === c.name?.toLowerCase()
      );
      const colorClean = c.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      const defaultVariantSku = `${cleanBaseSku}-${colorClean}-FS`;

      if (match) {
        results.push({
          ...match,
          color: c.name,
          colorCode: c.code || '#0A305D',
          size: match.size || 'Free Size'
        });
      } else {
        results.push({
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          color: c.name,
          colorCode: c.code || '#0A305D',
          size: 'Free Size',
          stockQuantity: 0,
          sku: defaultVariantSku,
          inStock: false
        });
      }
    });
    return results;
  }

  // Case 2: Sizes exist, no colors selected
  if (currentColors.length === 0 && currentSizes.length > 0) {
    currentSizes.forEach(s => {
      const match = existingVariants.find(
        v => v.size?.toLowerCase() === s?.toLowerCase()
      );
      const sizeClean = s.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      const defaultVariantSku = `${cleanBaseSku}-STD-${sizeClean}`;

      if (match) {
        results.push({
          ...match,
          color: match.color || 'Standard Color',
          colorCode: match.colorCode || '#0A305D',
          size: s
        });
      } else {
        results.push({
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          color: 'Standard Color',
          colorCode: '#0A305D',
          size: s,
          stockQuantity: 0,
          sku: defaultVariantSku,
          inStock: false
        });
      }
    });
    return results;
  }

  // Case 3: Both Colors and Sizes exist (Full Matrix)
  currentColors.forEach(c => {
    currentSizes.forEach(s => {
      const match = existingVariants.find(
        v => v.color?.toLowerCase() === c.name?.toLowerCase() && v.size?.toLowerCase() === s?.toLowerCase()
      );

      const colorClean = c.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      const sizeClean = s.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      const defaultVariantSku = `${cleanBaseSku}-${colorClean}-${sizeClean}`;

      if (match) {
        results.push({
          ...match,
          color: c.name,
          colorCode: c.code || '#0A305D',
          size: s
        });
      } else {
        results.push({
          id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          color: c.name,
          colorCode: c.code || '#0A305D',
          size: s,
          stockQuantity: 0,
          sku: defaultVariantSku,
          inStock: false
        });
      }
    });
  });

  return results;
}

export default function ProductAddPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const colorDirectInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [thumbs, setThumbs] = useState([]);
  const [tags, setTags] = useState(['New Collection']);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('published');
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [editingThumbId, setEditingThumbId] = useState(null);

  // Active color tab in the Image Gallery: 'ALL' or Color Name
  const [activeImageColorTab, setActiveImageColorTab] = useState('ALL');
  // Store which color is being directly uploaded to via color section
  const [directColorTarget, setDirectColorTarget] = useState('');

  // Controlled Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [gender, setGender] = useState('Women');
  const [selectedMainCat, setSelectedMainCat] = useState('Sarees');
  const [primaryCategory, setPrimaryCategory] = useState('Soft Silk & Pure Silks Sarees');
  const [selectedCategories, setSelectedCategories] = useState(['Soft Silk & Pure Silks Sarees']);
  const [showExtraTags, setShowExtraTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Color & Size Variant Management State
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorCode, setCustomColorCode] = useState('#0A305D');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [bulkStockInput, setBulkStockInput] = useState('0');
  const [sizeChart, setSizeChart] = useState(DEFAULT_SIZE_CHART);

  // Fetch product by ID if in Edit Mode
  useEffect(() => {
    if (id) {
      const fetchProductDetails = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/products/${id}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            const p = data.data;
            setName(p.name || '');
            setDescription(p.description || '');
            setPrice(p.price !== undefined && p.price !== null ? p.price.toString() : '');
            setSalePrice(p.salePrice !== undefined && p.salePrice !== null ? p.salePrice.toString() : '');
            setSku(p.sku || '');
            setStockQuantity(p.stockQuantity ?? 0);
            const resolved = findCategoryHierarchy(p.category || (p.categories && p.categories[0]), p.gender || 'Women');
            setGender(resolved.gender);
            setSelectedMainCat(resolved.mainCategory);
            setPrimaryCategory(resolved.subCategory);
            setSelectedCategories(p.categories && p.categories.length > 0 ? p.categories : [resolved.subCategory]);
            setTags(p.tags || []);
            setStatus(p.status || 'published');

            // Handle colors
            let loadedColors = [];
            if (p.colors && Array.isArray(p.colors) && p.colors.length > 0) {
              loadedColors = p.colors.map((c, i) =>
                typeof c === 'string'
                  ? { id: `c-${i}`, name: c, code: '#0A305D' }
                  : { id: `c-${i}`, name: c.name || '', code: c.code || '#0A305D' }
              );
            } else if (p.color) {
              loadedColors = [{ id: 'c-1', name: p.color, code: '#0A305D' }];
            }
            setColors(loadedColors);

            // Handle sizes
            let loadedSizes = [];
            if (p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0) {
              loadedSizes = p.sizes;
            } else if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
              loadedSizes = [...new Set(p.variants.map(v => v.size).filter(Boolean))];
            }
            setSizes(loadedSizes);

            // Handle variants
            if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
              setVariants(p.variants.map((v, i) => ({
                id: v.id || v._id || `v-${i}`,
                color: v.color || '',
                colorCode: v.colorCode || '#0A305D',
                size: v.size || 'Free Size',
                stockQuantity: v.stockQuantity ?? 0,
                sku: v.sku || '',
                inStock: (v.stockQuantity ?? 0) > 0,
                image: v.image || ''
              })));
            } else {
              setVariants(generateVariantList(loadedColors, loadedSizes, [], p.sku || ''));
            }

            // Build Thumbs with Color Association from colorImages and images
            const builtThumbs = [];
            const processedUrls = new Set();
            let thumbCounter = 1;

            if (p.colorImages && Array.isArray(p.colorImages)) {
              p.colorImages.forEach(ci => {
                const cName = ci.color || '';
                if (Array.isArray(ci.images)) {
                  ci.images.forEach(imgUrl => {
                    if (imgUrl && !processedUrls.has(imgUrl)) {
                      processedUrls.add(imgUrl);
                      builtThumbs.push({
                        id: thumbCounter++,
                        src: imgUrl,
                        public_id: imgUrl,
                        primary: builtThumbs.length === 0,
                        color: cName,
                        uploading: false
                      });
                    }
                  });
                }
              });
            }

            // Add any general images from p.images not already in colorImages
            const allImagesList = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
            allImagesList.forEach(imgUrl => {
              if (imgUrl && !processedUrls.has(imgUrl)) {
                processedUrls.add(imgUrl);
                builtThumbs.push({
                  id: thumbCounter++,
                  src: imgUrl,
                  public_id: imgUrl,
                  primary: builtThumbs.length === 0,
                  color: '',
                  uploading: false
                });
              }
            });

            if (p.sizeChart && p.sizeChart.sections) {
              setSizeChart(p.sizeChart);
            }

            setThumbs(builtThumbs);
          }
        } catch (err) {
          console.warn('API error fetching product details:', err);
          showToast('Failed to load product details', 'error', false);
        }
      };
      fetchProductDetails();
    }
  }, [id]);

  // Color Management Handlers
  const handleToggleColorPreset = (preset) => {
    const exists = colors.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
    let nextColors;
    if (exists) {
      nextColors = colors.filter(c => c.name.toLowerCase() !== preset.name.toLowerCase());
      // Revert thumbs assigned to this removed color to general
      setThumbs(ts => ts.map(t => (t.color?.toLowerCase() === preset.name.toLowerCase() ? { ...t, color: '' } : t)));
      if (activeImageColorTab.toLowerCase() === preset.name.toLowerCase()) {
        setActiveImageColorTab('ALL');
      }
    } else {
      nextColors = [...colors, { id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, name: preset.name, code: preset.code }];
    }
    setColors(nextColors);
    setVariants(prev => generateVariantList(nextColors, sizes, prev, sku));
  };

  const handleAddCustomColor = (e) => {
    if (e) e.preventDefault();
    const raw = customColorName.trim();
    if (!raw) return;

    // Support comma-separated multiple colors entry (e.g. "Royal Blue, Emerald, Peach")
    const parts = raw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    let addedCount = 0;
    let nextColors = [...colors];

    parts.forEach(part => {
      const exists = nextColors.some(c => c.name.toLowerCase() === part.toLowerCase());
      if (!exists) {
        const matchingPreset = PRESET_COLORS.find(p => p.name.toLowerCase() === part.toLowerCase());
        const code = matchingPreset ? matchingPreset.code : (parts.length === 1 ? customColorCode : '#0A305D');
        nextColors.push({
          id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: part,
          code: code || '#0A305D'
        });
        addedCount++;
      }
    });

    if (addedCount === 0) {
      setToast({ show: true, msg: 'Color(s) already added!' });
      setTimeout(() => setToast({ show: false, msg: '' }), 1500);
      return;
    }

    setColors(nextColors);
    setVariants(prev => generateVariantList(nextColors, sizes, prev, sku));
    setCustomColorName('');
    setToast({ show: true, msg: `Added ${addedCount} color${addedCount > 1 ? 's' : ''}!` });
    setTimeout(() => setToast({ show: false, msg: '' }), 1500);
  };

  const handleRemoveColor = (colorName) => {
    const nextColors = colors.filter(c => c.name.toLowerCase() !== colorName.toLowerCase());
    setColors(nextColors);
    setVariants(prev => generateVariantList(nextColors, sizes, prev, sku));
    // Reset images assigned to removed color to unassigned
    setThumbs(ts => ts.map(t => (t.color?.toLowerCase() === colorName.toLowerCase() ? { ...t, color: '' } : t)));
    if (activeImageColorTab.toLowerCase() === colorName.toLowerCase()) {
      setActiveImageColorTab('ALL');
    }
  };

  const handleClearAllColors = () => {
    if (colors.length === 0) return;
    setColors([]);
    setVariants(prev => generateVariantList([], sizes, prev, sku));
    setThumbs(ts => ts.map(t => ({ ...t, color: '' })));
    setActiveImageColorTab('ALL');
    setToast({ show: true, msg: 'Cleared all colors' });
    setTimeout(() => setToast({ show: false, msg: '' }), 1500);
  };

  // Size Management Handlers
  const handleScrollToSizes = () => {
    const el = document.getElementById('available-sizes-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulse');
      setTimeout(() => el.classList.remove('highlight-pulse'), 1800);
      const input = document.getElementById('custom-size-input');
      if (input) {
        setTimeout(() => input.focus(), 350);
      }
    }
  };

  const handleToggleSizePreset = (sizeStr) => {
    const exists = sizes.includes(sizeStr);
    let nextSizes;
    if (exists) {
      nextSizes = sizes.filter(s => s !== sizeStr);
    } else {
      nextSizes = [...sizes, sizeStr];
    }
    setSizes(nextSizes);
    setVariants(prev => generateVariantList(colors, nextSizes, prev, sku));
    setSizeChart(prev => syncSizeChartWithSizes(prev, nextSizes));
  };

  const handleAddCustomSize = (e) => {
    if (e) e.preventDefault();
    const raw = customSizeInput.trim();
    if (!raw) return;

    // Support comma-separated multiple sizes (e.g. "38, 40, 42, 44" or "S, M, L, XL")
    const parts = raw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    let addedCount = 0;
    let nextSizes = [...sizes];

    parts.forEach(part => {
      if (!nextSizes.includes(part)) {
        nextSizes.push(part);
        addedCount++;
      }
    });

    if (addedCount === 0) {
      setToast({ show: true, msg: 'Size(s) already added!' });
      setTimeout(() => setToast({ show: false, msg: '' }), 1500);
      return;
    }

    setSizes(nextSizes);
    setVariants(prev => generateVariantList(colors, nextSizes, prev, sku));
    setSizeChart(prev => syncSizeChartWithSizes(prev, nextSizes));
    setCustomSizeInput('');
    setToast({ show: true, msg: `Added ${addedCount} size${addedCount > 1 ? 's' : ''}!` });
    setTimeout(() => setToast({ show: false, msg: '' }), 1500);
  };

  const handleApplySizeBundle = (bundleItems) => {
    let nextSizes = [...sizes];
    let addedCount = 0;
    bundleItems.forEach(item => {
      if (!nextSizes.includes(item)) {
        nextSizes.push(item);
        addedCount++;
      }
    });
    setSizes(nextSizes);
    setVariants(prev => generateVariantList(colors, nextSizes, prev, sku));
    setSizeChart(prev => syncSizeChartWithSizes(prev, nextSizes));
    setToast({ show: true, msg: `Added ${addedCount} size${addedCount > 1 ? 's' : ''} from bundle!` });
    setTimeout(() => setToast({ show: false, msg: '' }), 1500);
  };

  const handleRemoveSize = (sizeStr) => {
    const nextSizes = sizes.filter(s => s !== sizeStr);
    setSizes(nextSizes);
    setVariants(prev => generateVariantList(colors, nextSizes, prev, sku));
    setSizeChart(prev => syncSizeChartWithSizes(prev, nextSizes));
  };

  const handleClearAllSizes = () => {
    if (sizes.length === 0) return;
    setSizes([]);
    setVariants(prev => generateVariantList(colors, [], prev, sku));
    setSizeChart(prev => syncSizeChartWithSizes(prev, []));
    setToast({ show: true, msg: 'Cleared all sizes' });
    setTimeout(() => setToast({ show: false, msg: '' }), 1500);
  };

  // Variant Stock & SKU Management
  const handleVariantStockChange = (varId, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setVariants(prev => prev.map(v => v.id === varId ? { ...v, stockQuantity: num, inStock: num > 0 } : v));
  };

  const handleVariantSkuChange = (varId, val) => {
    setVariants(prev => prev.map(v => v.id === varId ? { ...v, sku: val } : v));
  };

  const handleDeleteVariant = (varId) => {
    setVariants(prev => prev.filter(v => v.id !== varId));
  };

  const handleApplyBulkStock = () => {
    const num = Math.max(0, parseInt(bulkStockInput, 10) || 0);
    setVariants(prev => prev.map(v => ({ ...v, stockQuantity: num, inStock: num > 0 })));
    setToast({ show: true, msg: `Set stock to ${num} for all combinations!` });
    setTimeout(() => setToast({ show: false, msg: '' }), 1800);
  };

  // Category Cascading Handlers
  const currentGroups = getDepartmentHierarchy(gender);
  const activeGroup = currentGroups.find(g => g.name === selectedMainCat) || currentGroups[0];
  const availableSubCategories = activeGroup?.items || [];

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    const groups = getDepartmentHierarchy(newGender);
    const firstGroup = groups[0];
    const firstSub = firstGroup ? firstGroup.items[0] : '';
    setSelectedMainCat(firstGroup?.name || '');
    setPrimaryCategory(firstSub);
    setSelectedCategories([firstSub]);
  };

  const handleMainCatChange = (mainCatName) => {
    setSelectedMainCat(mainCatName);
    const group = currentGroups.find(g => g.name === mainCatName);
    const firstSub = group ? group.items[0] : '';
    setPrimaryCategory(firstSub);
    setSelectedCategories([firstSub]);
  };

  const handleSubCatChange = (subCatName) => {
    setPrimaryCategory(subCatName);
    setSelectedCategories(prev => {
      if (prev.includes(subCatName)) return prev;
      return [subCatName, ...prev.filter(c => c !== primaryCategory)];
    });
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        if (cat === primaryCategory) return prev;
        return prev.filter(c => c !== cat);
      }
      return [...prev, cat];
    });
  };

  // Color-Based Image Upload and Management
  const makePrimary = (id) => {
    setThumbs(ts => {
      const found = ts.find(t => t.id === id);
      const rest = ts.filter(t => t.id !== id).map(t => ({ ...t, primary: false }));
      return [{ ...found, primary: true }, ...rest];
    });
  };

  const handleImageColorChange = (thumbId, newColor) => {
    setThumbs(ts => ts.map(t => (t.id === thumbId ? { ...t, color: newColor } : t)));
    setToast({ show: true, msg: newColor ? `Assigned to ${newColor}` : 'Set to General photo' });
    setTimeout(() => setToast({ show: false, msg: '' }), 1200);
  };

  const triggerDirectColorUpload = (colorName) => {
    setDirectColorTarget(colorName);
    setActiveImageColorTab(colorName);
    if (colorDirectInputRef.current) {
      colorDirectInputRef.current.value = '';
      colorDirectInputRef.current.click();
    }
  };

  // Upload new images (optionally assigned to a specific color)
  const addThumbs = async (files, assignedColor = '') => {
    const targetColor = assignedColor || (activeImageColorTab !== 'ALL' ? activeImageColorTab : '');

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const localSrc = e.target.result;
        const tempId = nextId++;

        setThumbs(ts => {
          const isFirst = ts.length === 0;
          return [...ts, {
            id: tempId,
            src: localSrc,
            primary: isFirst,
            color: targetColor,
            uploading: true
          }];
        });

        try {
          const compressedFile = await compressImage(file);
          const formData = new FormData();
          formData.append('image', compressedFile);

          const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
          });

          const data = await res.json();
          if (res.ok && data.success && data.url) {
            setThumbs(ts => ts.map(t => t.id === tempId ? {
              ...t,
              src: data.url,
              public_id: data.public_id || data.url,
              color: targetColor,
              uploading: false
            } : t));
          } else {
            setThumbs(ts => ts.map(t => t.id === tempId ? { ...t, uploading: false } : t));
          }
        } catch (err) {
          console.warn('Upload API warning, using local preview:', err);
          setThumbs(ts => ts.map(t => t.id === tempId ? { ...t, uploading: false } : t));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // DELETE Image from server & local state
  const removeThumb = async (thumbId) => {
    const targetThumb = thumbs.find(t => t.id === thumbId);

    if (targetThumb && (targetThumb.public_id || (targetThumb.src && targetThumb.src.startsWith('http')))) {
      try {
        await fetch(`${API_BASE_URL}/upload`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: targetThumb.public_id || targetThumb.src })
        });
      } catch (err) {
        console.warn('API warning deleting image:', err);
      }
    }

    setThumbs(ts => {
      const next = ts.filter(t => t.id !== thumbId);
      if (next.length && ts.find(t => t.id === thumbId)?.primary) {
        return next.map((t, i) => ({ ...t, primary: i === 0 }));
      }
      return next;
    });
  };

  // Edit / Replace Image
  const triggerReplaceThumb = (thumbId) => {
    setEditingThumbId(thumbId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingThumbId) return;
    if (!file.type.startsWith('image/')) return;

    const targetThumb = thumbs.find(t => t.id === editingThumbId);
    if (!targetThumb) return;

    setThumbs(ts => ts.map(t => t.id === editingThumbId ? { ...t, uploading: true } : t));

    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedFile);
      if (targetThumb.public_id || targetThumb.src) {
        formData.append('old_public_id', targetThumb.public_id || targetThumb.src);
      }

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setThumbs(ts => ts.map(t => t.id === editingThumbId ? {
          ...t,
          src: data.url,
          public_id: data.public_id || data.url,
          uploading: false
        } : t));
        showToast('Image replaced on Cloudinary!', false);
      } else {
        setThumbs(ts => ts.map(t => t.id === editingThumbId ? { ...t, uploading: false } : t));
        showToast(data.message || 'Failed to replace image', 'error', false);
      }
    } catch (err) {
      console.warn('Error replacing image:', err);
      setThumbs(ts => ts.map(t => t.id === editingThumbId ? { ...t, uploading: false } : t));
      showToast('Error uploading replacement image', 'error', false);
    } finally {
      setEditingThumbId(null);
    }
  };

  const handleTagKey = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags(t => [...t, tagInput.trim()]);
      setTagInput('');
    }
  };

  const showToast = (msg, type = 'success', shouldNavigate = false) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, msg, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, msg: '', type: 'success' });
      // Only navigate on success, NEVER on error
      if (shouldNavigate && type === 'success') {
        navigate('/admin/products');
      }
    }, type === 'error' ? 3500 : 1500);
  };

  const closeToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: false, msg: '', type: 'success' });
  };

  // Submit Product to Backend
  const handleSubmitProduct = async (targetStatus = status) => {
    // 1. Validation for Published status
    if (targetStatus === 'published') {
      if (!name.trim()) {
        showToast('Please enter a product name before publishing', 'error', false);
        return;
      }
      if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        showToast('Please enter a valid price before publishing', 'error', false);
        return;
      }
    } else if (targetStatus === 'draft') {
      if (price && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
        showToast('Please enter a valid price for the draft', 'error', false);
        return;
      }
    }

    if (salePrice && (isNaN(parseFloat(salePrice)) || parseFloat(salePrice) < 0)) {
      showToast('Sale price must be a valid positive number', 'error', false);
      return;
    }

    if (salePrice && price && parseFloat(salePrice) > parseFloat(price)) {
      showToast('Sale price cannot be greater than the regular price', 'error', false);
      return;
    }

    setIsSubmitting(true);
    setStatus(targetStatus);

    const imageUrls = thumbs.map(t => t.src).filter(Boolean);
    const primaryImg = thumbs.find(t => t.primary)?.src || (imageUrls.length > 0 ? imageUrls[0] : '');
    const mainCat = primaryCategory || selectedCategories[0] || 'Soft Silk & Pure Silks Sarees';

    const totalVariantStock = variants.length > 0
      ? variants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0)
      : (parseInt(stockQuantity, 10) || 0);

    // Build colorImages mapping
    const colorImagesPayload = colors.map(c => {
      const matchingImgs = thumbs
        .filter(t => t.color && t.color.toLowerCase() === c.name.toLowerCase() && t.src)
        .map(t => t.src);
      return {
        color: c.name,
        colorCode: c.code || '#0A305D',
        images: matchingImgs
      };
    }).filter(ci => ci.images.length > 0);

    // Build variants with linked color images
    const cleanSku = (sku || 'CSP').trim();
    const formattedVariants = variants.map(v => {
      const colorImgs = thumbs.filter(t => t.color && t.color.toLowerCase() === v.color.toLowerCase() && t.src);
      const varImg = colorImgs.length > 0 ? colorImgs[0].src : primaryImg;
      return {
        id: v.id,
        color: v.color,
        colorCode: v.colorCode || '#0A305D',
        size: v.size,
        stockQuantity: Math.max(0, parseInt(v.stockQuantity, 10) || 0),
        sku: v.sku || `${cleanSku}-${v.color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}-${v.size.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase()}`,
        inStock: (parseInt(v.stockQuantity, 10) || 0) > 0,
        image: varImg
      };
    });

    const productPayload = {
      name: name.trim() || (targetStatus === 'draft' ? 'Untitled Draft Product' : 'New Product'),
      description: description.trim(),
      price: parseFloat(price) || 0,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      sku: cleanSku || `CSP-${Date.now().toString().slice(-6)}`,
      stockQuantity: totalVariantStock,
      category: mainCat,
      categories: selectedCategories.length > 0 ? selectedCategories : [mainCat],
      gender: gender || 'Women',
      images: imageUrls,
      image: primaryImg,
      tags: tags,
      status: targetStatus,
      currency: 'MYR',
      inStock: totalVariantStock > 0,
      color: colors.length > 0 ? colors[0].name : '',
      colors: colors.map(c => ({ name: c.name, code: c.code || '#0A305D' })),
      sizes: sizes,
      colorImages: colorImagesPayload,
      variants: formattedVariants,
      sizeChart: sizeChart
    };

    const url = isEditMode ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productPayload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(
          isEditMode
            ? 'Product updated successfully!'
            : (targetStatus === 'draft' ? 'Draft saved to database!' : 'Product published successfully!'),
          'success',
          true // Only navigate on success
        );
      } else {
        // Backend API returned error response - show in RED toast and DO NOT navigate
        const errorMsg = data.message || data.error || (isEditMode ? 'Failed to update product' : 'Failed to save product');
        showToast(errorMsg, 'error', false);
      }
    } catch (err) {
      console.error('Backend API connection error:', err);
      // Network or connection error - show in RED toast and DO NOT navigate
      const errorMsg = err.message ? `Connection error: ${err.message}` : 'Failed to connect to backend server. Please try again.';
      showToast(errorMsg, 'error', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered thumbnails according to selected color tab
  const displayedThumbs = activeImageColorTab === 'ALL'
    ? thumbs
    : thumbs.filter(t => t.color && t.color.toLowerCase() === activeImageColorTab.toLowerCase());

  const getColorCode = (colorName) => {
    if (!colorName) return '#94A3B8';
    const found = colors.find(c => c.name.toLowerCase() === colorName.toLowerCase())
      || PRESET_COLORS.find(p => p.name.toLowerCase() === colorName.toLowerCase());
    return found ? found.code : '#0A305D';
  };

  return (
    <div className="shell">
      <AdminSidebar />
      <main>
        <Link className="back-link" to="/admin/products">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 18l-6-6 6-6"/>
          </svg>
          Back to Products
        </Link>

        <div className="topbar">
          <div>
            <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <div className="sub">
              {isEditMode
                ? 'Update product details, color-based images, pricing, and stock.'
                : 'Fill in the details below to list a new saree or garment.'}
            </div>
          </div>
          <div className="top-actions">
            <button
              className="btn-outline"
              disabled={isSubmitting}
              onClick={() => handleSubmitProduct('draft')}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              className="btn-gold"
              disabled={isSubmitting}
              onClick={() => handleSubmitProduct('published')}
            >
              {isSubmitting
                ? (isEditMode ? 'Updating...' : 'Publishing...')
                : (isEditMode ? 'Update Product' : 'Publish Product')}
            </button>
          </div>
        </div>

        <div className="grid">
          {/* Main Column */}
          <div>
            {/* General Info Panel */}
            <div className="panel">
              <h3>General Information</h3>
              <div className="phint">The name and description customers will see on the product page.</div>
              <div className="field">
                <label htmlFor="pname">Product name *</label>
                <input
                  type="text"
                  id="pname"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Pure Kanchipuram Soft Silk Saree…"
                />
              </div>
              <div className="field">
                <label htmlFor="pdesc">Description</label>
                <textarea
                  id="pdesc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter product detailed description..."
                />
              </div>
            </div>

            {/* Product Images Panel with COLOR-BASED UPLOADER */}
            <div className="panel image-master-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Product Images &amp; Color Photo Gallery</h3>
                  <div className="phint" style={{ marginBottom: 0 }}>
                    Upload photos and assign them to specific colors so shoppers see the right photo when switching colors.
                  </div>
                </div>
                <div className="combination-count-pill">
                  {thumbs.length} {thumbs.length === 1 ? 'Photo' : 'Photos'}
                </div>
              </div>

              {/* Color Image Filter Tabs */}
              <div className="color-gallery-tabs-wrap">
                <div className="color-gallery-tabs-label">Filter &amp; Upload by Color:</div>
                <div className="color-gallery-tabs-list">
                  <button
                    type="button"
                    className={`color-img-tab-btn ${activeImageColorTab === 'ALL' ? 'active' : ''}`}
                    onClick={() => setActiveImageColorTab('ALL')}
                  >
                    <span>All Images ({thumbs.length})</span>
                  </button>

                  {colors.map(c => {
                    const countForColor = thumbs.filter(t => t.color && t.color.toLowerCase() === c.name.toLowerCase()).length;
                    const isActive = activeImageColorTab.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.id || c.name}
                        type="button"
                        className={`color-img-tab-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveImageColorTab(c.name)}
                      >
                        <span className="tab-color-dot" style={{ backgroundColor: c.code || '#0A305D' }}></span>
                        <span>{c.name}</span>
                        <span className="tab-color-count">({countForColor})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dropzone with Dynamic Context */}
              <div
                className={`dropzone${isDragging ? ' drag' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                onDrop={e => { e.preventDefault(); setIsDragging(false); addThumbs(e.dataTransfer.files); }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}>
                  <path d="M12 16V4M12 4l-4 4M12 4l4 4"/>
                  <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>
                </svg>
                <div className="t1">
                  {activeImageColorTab === 'ALL'
                    ? 'Drag images here, or click to browse'
                    : (
                      <span>
                        Upload photos for <strong style={{ color: getColorCode(activeImageColorTab) }}>{activeImageColorTab}</strong>
                      </span>
                    )
                  }
                </div>
                <div className="t2">
                  {activeImageColorTab === 'ALL'
                    ? 'PNG, JPG, or WEBP up to 10MB each. Assign to specific colors anytime below.'
                    : `Any photos dropped here will be linked to ${activeImageColorTab}.`}
                </div>
              </div>

              {/* Hidden file input for multi upload */}
              <input
                type="file" ref={fileInputRef} accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => { addThumbs(e.target.files); e.target.value = ''; }}
              />

              {/* Hidden file input for replacing single image */}
              <input
                type="file" ref={replaceFileInputRef} accept="image/*" style={{ display: 'none' }}
                onChange={handleReplaceFileChange}
              />

              {/* Hidden file input for direct color button upload */}
              <input
                type="file" ref={colorDirectInputRef} accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => {
                  if (directColorTarget) {
                    addThumbs(e.target.files, directColorTarget);
                  }
                  e.target.value = '';
                }}
              />

              {/* Thumbnails Grid with Color Tag Selector on each image */}
              {displayedThumbs.length > 0 ? (
                <div className="thumb-grid">
                  {displayedThumbs.map(t => (
                    <div key={t.id} className="thumb-card" data-primary={t.primary}>
                      <div className="thumb-img-wrapper">
                        {t.src
                          ? <img src={t.src} alt="" className="thumb-img" />
                          : <div className="swatch-fill" style={{ background: '#CBD5E1' }}></div>
                        }

                        {t.uploading && (
                          <div className="thumb-loading-overlay">
                            <div className="spinner"></div>
                            <span>Uploading...</span>
                          </div>
                        )}

                        {t.primary && <span className="primary-badge">★ Main Photo</span>}

                        <div className="thumb-actions-overlay">
                          {!t.primary && (
                            <button
                              type="button"
                              className="set-primary-btn"
                              onClick={() => makePrimary(t.id)}
                            >
                              Set Main
                            </button>
                          )}
                          <button
                            type="button"
                            className="edit-image-btn"
                            title="Replace Image"
                            onClick={(e) => { e.stopPropagation(); triggerReplaceThumb(t.id); }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                            Edit
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-btn"
                          aria-label="Remove image"
                          title="Delete Image"
                          onClick={(e) => { e.stopPropagation(); removeThumb(t.id); }}
                        >
                          ×
                        </button>
                      </div>

                      {/* Color Selector for each individual image */}
                      <div className="thumb-color-control">
                        <span
                          className="thumb-color-indicator-dot"
                          style={{ backgroundColor: getColorCode(t.color) }}
                          title={t.color || 'General / All Colors'}
                        />
                        <select
                          className="thumb-color-dropdown-select"
                          value={t.color || ''}
                          onChange={(e) => handleImageColorChange(t.id, e.target.value)}
                          title="Assign this photo to a specific color"
                        >
                          <option value="">General (All Colors)</option>
                          {colors.map(c => (
                            <option key={c.id || c.name} value={c.name}>
                              ● {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-thumbs-notice">
                  {activeImageColorTab === 'ALL' ? (
                    <span>No product images uploaded yet. Drag &amp; drop photos above.</span>
                  ) : (
                    <span>No photos uploaded for <strong>{activeImageColorTab}</strong> yet. Click the upload area above to add photos for this color.</span>
                  )}
                </div>
              )}
            </div>

            {/* Pricing & Stock Panel */}
            <div className="panel">
              <h3>Pricing &amp; Inventory</h3>
              <div className="phint">Set retail pricing and inventory quantity.</div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="pprice">Regular price *</label>
                  <div className="prefix-input">
                    <span className="prefix-span">MYR</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      id="pprice"
                      value={price}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setPrice(val);
                        }
                      }}
                      placeholder="0.00"
                      style={{ paddingLeft: '58px' }}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="psale">Sale price <span style={{ fontWeight: 400, color: 'var(--ink-faint)' }}>(optional)</span></label>
                  <div className="prefix-input">
                    <span className="prefix-span">MYR</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      id="psale"
                      value={salePrice}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                          setSalePrice(val);
                        }
                      }}
                      placeholder="0.00"
                      style={{ paddingLeft: '58px' }}
                    />
                  </div>
                </div>
              </div>
              <div className="two-col">
                <div className="field">
                  <label htmlFor="psku">Base SKU</label>
                  <input
                    type="text"
                    id="psku"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="e.g. CSP-SLK-100"
                  />
                </div>
                <div className="field">
                  <label htmlFor="pstock">Total Stock Quantity</label>
                  <input
                    type="number"
                    id="pstock"
                    value={variants.length > 0 ? variants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0) : stockQuantity}
                    onChange={e => setStockQuantity(e.target.value)}
                    readOnly={variants.length > 0}
                    style={variants.length > 0 ? { backgroundColor: '#F8FAFC', color: '#0A305D', fontWeight: 700 } : {}}
                  />
                  {variants.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>✓</span> Synced with {variants.length} color &amp; size combinations below
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colors, Sizes & Separate Stock Combinations Master Panel */}
            <div className="panel variants-master-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Colors, Sizes &amp; Separate Stock Tracking</h3>
                  <div className="phint" style={{ marginBottom: 0 }}>
                    Configure multiple colors and sizes. Upload photos specifically for each color, and track independent stock.
                  </div>
                </div>
                <div className="combination-count-pill">
                  {variants.length} {variants.length === 1 ? 'Combination' : 'Combinations'}
                </div>
              </div>

              {/* 1. Colors Section */}
              <div className="var-section">
                <div className="var-section-header">
                  <div>
                    <label className="var-label">1. Available Colors ({colors.length})</label>
                    <span className="var-hint">Select preset colors or type custom color names</span>
                  </div>
                  {colors.length > 0 && (
                    <button
                      type="button"
                      className="clear-all-link-btn"
                      onClick={handleClearAllColors}
                    >
                      Clear All Colors
                    </button>
                  )}
                </div>

                {/* Active Colors Chips with Photo Preview & Quick Upload */}
                {colors.length > 0 ? (
                  <div className="active-color-cards-grid">
                    {colors.map(c => {
                      const colorImagesCount = thumbs.filter(t => t.color && t.color.toLowerCase() === c.name.toLowerCase()).length;
                      return (
                        <div key={c.id || c.name} className="active-color-card">
                          <div className="color-card-top">
                            <span className="color-swatch-dot" style={{ backgroundColor: c.code }}></span>
                            <span className="color-name-text">{c.name}</span>
                            <button
                              type="button"
                              className="chip-remove-btn"
                              onClick={() => handleRemoveColor(c.name)}
                              title={`Remove ${c.name}`}
                            >
                              ×
                            </button>
                          </div>
                          <div className="color-card-bottom">
                            <button
                              type="button"
                              className="color-upload-mini-btn"
                              onClick={() => triggerDirectColorUpload(c.name)}
                              title={`Upload photos for ${c.name}`}
                            >
                              <span>📷</span>
                              <span>{colorImagesCount > 0 ? `${colorImagesCount} photos` : '+ Upload Photo'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-items-warning">
                    ⚠️ No colors selected. Click preset colors below or type a custom color.
                  </div>
                )}

                <div className="preset-label">Quick Color Presets (Click to toggle):</div>
                <div className="preset-chips-grid">
                  {PRESET_COLORS.map(p => {
                    const isSelected = colors.some(c => c.name.toLowerCase() === p.name.toLowerCase());
                    return (
                      <button
                        key={p.name}
                        type="button"
                        className={`preset-color-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleToggleColorPreset(p)}
                      >
                        <span className="preset-swatch-circle" style={{ backgroundColor: p.code }}></span>
                        <span>{p.name}</span>
                        {isSelected && <span className="preset-check">✓</span>}
                      </button>
                    );
                  })}
                </div>

                <form className="custom-input-bar" onSubmit={handleAddCustomColor}>
                  <input
                    type="text"
                    placeholder="Custom color(s) — comma separated allowed (e.g. Peacock Blue, Rose Gold)"
                    value={customColorName}
                    onChange={e => setCustomColorName(e.target.value)}
                    className="custom-text-input"
                  />
                  <div className="color-picker-wrapper" title="Pick color swatch hex">
                    <input
                      type="color"
                      value={customColorCode}
                      onChange={e => setCustomColorCode(e.target.value)}
                      className="native-color-picker"
                    />
                    <span className="color-preview-box" style={{ backgroundColor: customColorCode }}></span>
                  </div>
                  <button type="submit" className="add-btn-secondary">
                    + Add Color(s)
                  </button>
                </form>
              </div>

              {/* 2. Sizes Section */}
              <div className="var-section" id="available-sizes-section">
                <div className="var-section-header">
                  <div>
                    <label className="var-label">2. Available Sizes ({sizes.length})</label>
                    <span className="var-hint">Select preset sizes, quick bundles, or enter custom sizes</span>
                  </div>
                  {sizes.length > 0 && (
                    <button
                      type="button"
                      className="clear-all-link-btn"
                      onClick={handleClearAllSizes}
                    >
                      Clear All Sizes
                    </button>
                  )}
                </div>

                {/* Quick Size Bundles */}
                <div className="size-bundles-bar">
                  <span className="bundles-title">⚡ Quick Size Bundles:</span>
                  <div className="bundles-chips-group">
                    {SIZE_BUNDLES.map(b => (
                      <button
                        key={b.label}
                        type="button"
                        className="bundle-pill-btn"
                        onClick={() => handleApplySizeBundle(b.items)}
                      >
                        + {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {sizes.length > 0 ? (
                  <div className="active-chips-row">
                    {sizes.map(s => (
                      <span key={s} className="active-size-badge">
                        <span className="size-name-text">{s}</span>
                        <button
                          type="button"
                          className="chip-remove-btn"
                          onClick={() => handleRemoveSize(s)}
                          title={`Remove ${s}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="no-items-warning">
                    ⚠️ No sizes selected yet. Pick from presets below or add custom.
                  </div>
                )}

                <div className="preset-label">Quick Individual Sizes:</div>
                <div className="preset-chips-grid">
                  {PRESET_SIZES.map(s => {
                    const isSelected = sizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`preset-size-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => handleToggleSizePreset(s)}
                      >
                        <span>{s}</span>
                        {isSelected && <span className="preset-check">✓</span>}
                      </button>
                    );
                  })}
                </div>

                <form className="custom-input-bar" onSubmit={handleAddCustomSize}>
                  <input
                    type="text"
                    id="custom-size-input"
                    placeholder="Custom size(s) — comma separated allowed (e.g. 38, 40, 42, 44 or 5.5m)"
                    value={customSizeInput}
                    onChange={e => setCustomSizeInput(e.target.value)}
                    className="custom-text-input"
                  />
                  <button type="submit" className="add-btn-secondary">
                    + Add Size(s)
                  </button>
                </form>
              </div>

              {/* 3. Combinations Matrix & Separate Stock */}
              <div className="var-section combinations-matrix-block">
                <div className="var-section-header">
                  <div>
                    <label className="var-label">3. Combinations &amp; Separate Stock Inventory</label>
                    <span className="var-hint">Set exact stock count for each color and size combination</span>
                  </div>
                </div>

                {variants.length > 0 && (
                  <div className="bulk-stock-bar">
                    <div className="bulk-stock-left">
                      <span className="bulk-label">⚡ Quick Stock Fill:</span>
                      <div className="bulk-input-group">
                        <input
                          type="number"
                          min="0"
                          placeholder="Stock"
                          value={bulkStockInput}
                          onChange={e => setBulkStockInput(e.target.value)}
                          className="bulk-stock-input"
                        />
                        <button
                          type="button"
                          className="bulk-apply-btn"
                          onClick={handleApplyBulkStock}
                        >
                          Apply to All Combinations
                        </button>
                      </div>
                    </div>
                    <div className="bulk-stock-right">
                      <span className="total-stock-badge">
                        Total Stock: <strong>{variants.reduce((sum, v) => sum + (parseInt(v.stockQuantity, 10) || 0), 0)}</strong> units
                      </span>
                    </div>
                  </div>
                )}

                {variants.length > 0 ? (
                  <div className="var-table-container">
                    <table className="var-table">
                      <thead>
                        <tr>
                          <th>Color</th>
                          <th>Size</th>
                          <th>Combination SKU</th>
                          <th style={{ width: '130px' }}>Separate Stock</th>
                          <th>Status</th>
                          <th style={{ width: '50px', textAlign: 'center' }}>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map(v => {
                          const currentStock = parseInt(v.stockQuantity, 10) || 0;
                          const isInStock = currentStock > 0;
                          return (
                            <tr key={v.id || `${v.color}-${v.size}`}>
                              <td>
                                <div className="table-color-cell">
                                  <span className="table-color-dot" style={{ backgroundColor: v.colorCode || '#0A305D' }}></span>
                                  <span className="table-color-name">{v.color}</span>
                                </div>
                              </td>
                              <td>
                                <span className="table-size-badge">{v.size}</span>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-sku-input"
                                  value={v.sku || ''}
                                  onChange={e => handleVariantSkuChange(v.id, e.target.value)}
                                  placeholder="e.g. CSP-RED-M"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  className="table-stock-input"
                                  value={v.stockQuantity}
                                  onChange={e => handleVariantStockChange(v.id, e.target.value)}
                                />
                              </td>
                              <td>
                                {isInStock ? (
                                  <span className="var-status-badge in-stock">
                                    <span className="status-dot"></span> In Stock ({currentStock})
                                  </span>
                                ) : (
                                  <span className="var-status-badge out-stock">
                                    <span className="status-dot"></span> Out of Stock
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="var-delete-btn"
                                  onClick={() => handleDeleteVariant(v.id)}
                                  title={`Remove ${v.color} - ${v.size} combination`}
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-combinations-card">
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨 📏</div>
                    <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>No combinations generated yet</div>
                    <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                      Select at least one Color or Size above. Combinations with individual stock controls will appear here automatically.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Size Chart & Body Measurements Master Panel */}
            <div className="panel size-chart-panel" style={{ borderTop: '3px solid #0A305D' }}>
              <div className="panel-header-row">
                <div>
                  <h3>Size Chart &amp; Body Measurements</h3>
                  <div className="phint" style={{ marginBottom: 0 }}>
                    Configure body measurements and garment dimensions in both <strong>inches (in)</strong> and <strong>centimeters (cm)</strong>. Shoppers can switch units on the product page.
                  </div>
                </div>
                <div className="combination-count-pill" style={{ background: '#EFF6FF', color: '#0A305D', borderColor: '#BFDBFE' }}>
                  📏 Dual Unit (Inch &amp; Cm)
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <SizeChartEditor
                  sizeChart={sizeChart}
                  onChange={setSizeChart}
                  productSizes={sizes}
                  onScrollToSizes={handleScrollToSizes}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            {/* Unified Clear Cascading Category Selector */}
            <div className="panel organize-panel">
              <div className="panel-header-row">
                <h3>Product Category</h3>
                <span className="step-badge">Step-by-Step</span>
              </div>
              <div className="phint">Choose the department and category this product belongs to.</div>

              {/* 1. Target Department */}
              <div className="cat-step-block">
                <label className="cat-step-label">1. Department (Gender)</label>
                <div className="gender-pill-group">
                  {[
                    { id: 'Women', label: 'Women', icon: '👗' },
                    { id: 'Men', label: 'Men', icon: '👔' },
                    { id: 'Kids', label: 'Kids', icon: '🧒' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      className={`gender-pill-btn ${gender === g.id ? 'active' : ''}`}
                      onClick={() => handleGenderChange(g.id)}
                    >
                      <span className="pill-icon">{g.icon}</span>
                      <span className="pill-name">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Main Category */}
              <div className="cat-step-block">
                <label className="cat-step-label" htmlFor="mainCatSelect">2. Main Category</label>
                <select
                  id="mainCatSelect"
                  className="cat-select"
                  value={selectedMainCat}
                  onChange={(e) => handleMainCatChange(e.target.value)}
                >
                  {currentGroups.map(grp => (
                    <option key={grp.id || grp.name} value={grp.name}>
                      {grp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Sub-Category / Style */}
              <div className="cat-step-block">
                <label className="cat-step-label" htmlFor="subCatSelect">3. Sub-Category / Style</label>
                <select
                  id="subCatSelect"
                  className="cat-select"
                  value={primaryCategory}
                  onChange={(e) => handleSubCatChange(e.target.value)}
                >
                  {availableSubCategories.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Path Breadcrumb Preview */}
              <div className="selected-category-summary">
                <div className="summary-eyebrow">Assigned Category Path:</div>
                <div className="summary-path">
                  <span className="path-node path-gender">{gender}</span>
                  <span className="path-sep">›</span>
                  <span className="path-node path-main">{selectedMainCat}</span>
                  <span className="path-sep">›</span>
                  <span className="path-node path-sub">{primaryCategory}</span>
                </div>
              </div>

              {/* Optional: Extra Collections / Tags */}
              <div className="extra-tags-section">
                <button
                  type="button"
                  className="extra-tags-toggle"
                  onClick={() => setShowExtraTags(!showExtraTags)}
                >
                  <span>Additional Collections / Tags ({selectedCategories.length})</span>
                  <span>{showExtraTags ? '▲ Hide' : '▼ Expand'}</span>
                </button>

                {showExtraTags && (
                  <div className="extra-tags-body">
                    <div className="extra-tags-hint">
                      Click to tag this product with any additional collections:
                    </div>
                    <div className="tag-chips-picker">
                      {availableSubCategories.map(item => {
                        const isChecked = selectedCategories.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            className={`tag-chip-choice ${isChecked ? 'selected' : ''}`}
                            onClick={() => toggleCategory(item)}
                          >
                            {isChecked ? '✓ ' : '+ '}
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="panel">
              <h3>Tags</h3>
              <div className="phint">Press Enter to add a tag.</div>
              <div className="tag-input-wrap">
                {tags.map((tag, i) => (
                  <span key={i} className="tag-chip">
                    {tag}
                    <button aria-label="Remove tag" onClick={() => setTags(t => t.filter((_, j) => j !== i))}>×</button>
                  </span>
                ))}
                <input
                  type="text" placeholder="Add a tag…"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                />
              </div>
            </div>

            <div className="panel">
              <h3>Status</h3>
              <div className="phint">Draft products stay hidden from the storefront.</div>
              <div className="status-toggle">
                <button
                  type="button"
                  className={status === 'published' ? 'active' : ''}
                  onClick={() => setStatus('published')}
                >Published</button>
                <button
                  type="button"
                  className={status === 'draft' ? 'active' : ''}
                  onClick={() => setStatus('draft')}
                >Draft</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div 
        className={`toast ${toast.type}${toast.show ? ' show' : ''}`}
        role="alert"
        aria-live="assertive"
      >
        {toast.type === 'error' ? (
          <svg className="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ) : (
          <svg className="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        <span className="toast-msg">{toast.msg}</span>
        {toast.type === 'error' && (
          <button 
            type="button" 
            className="toast-close-btn" 
            onClick={closeToast}
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
