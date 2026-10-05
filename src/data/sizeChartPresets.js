/**
 * Size Chart Presets & Measurement Helpers for Chennai Silk Palace
 * Supports dual-unit (inch and cm) body measurements & product dimensions.
 */

export function inchToCm(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  if (num === 0) return '0';
  return (num * 2.54).toFixed(1).replace(/\.0$/, '');
}

export function cmToInch(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  if (num === 0) return '0';
  return (num / 2.54).toFixed(1).replace(/\.0$/, '');
}

export const SIZE_CHART_PRESETS = [
  {
    id: 'ethnic_top_bottom',
    label: 'Women\'s Kurti & Bottom Set (Top + Bottom)',
    data: {
      enabled: true,
      title: 'Body Measurement',
      unitDefault: 'inch',
      sections: [
        {
          id: 'sec-top',
          title: 'TOP',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          measurements: [
            {
              id: 'm-top-1',
              label: 'Across Shoulder',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            },
            {
              id: 'm-top-2',
              label: 'Bust',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            },
            {
              id: 'm-top-3',
              label: 'Hips',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            },
            {
              id: 'm-top-4',
              label: 'Waist',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            },
            {
              id: 'm-top-5',
              label: 'Front Length',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            }
          ]
        },
        {
          id: 'sec-bottom',
          title: 'BOTTOM',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          measurements: [
            {
              id: 'm-bot-1',
              label: 'Waist',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            },
            {
              id: 'm-bot-2',
              label: 'Outseam Length',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            },
            {
              id: 'm-bot-3',
              label: 'Inseam Length',
              inches: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' },
              cms: { S: '0', M: '0', L: '0', XL: '0', XXL: '0' }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'saree_blouse',
    label: 'Saree Blouse & Choli',
    data: {
      enabled: true,
      title: 'Body Measurement',
      unitDefault: 'inch',
      sections: [
        {
          id: 'sec-blouse',
          title: 'BLOUSE',
          sizes: ['32', '34', '36', '38', '40', '42', '44'],
          measurements: [
            {
              id: 'm-bl-1',
              label: 'Bust',
              inches: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' },
              cms: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' }
            },
            {
              id: 'm-bl-2',
              label: 'Underbust (Waist)',
              inches: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' },
              cms: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' }
            },
            {
              id: 'm-bl-3',
              label: 'Shoulder',
              inches: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' },
              cms: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' }
            },
            {
              id: 'm-bl-4',
              label: 'Blouse Length',
              inches: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' },
              cms: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' }
            },
            {
              id: 'm-bl-5',
              label: 'Armhole',
              inches: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' },
              cms: { '32': '0', '34': '0', '36': '0', '38': '0', '40': '0', '42': '0', '44': '0' }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'single_top',
    label: 'Standard Kurti / Top / Dress (Single Table)',
    data: {
      enabled: true,
      title: 'Body Measurement',
      unitDefault: 'inch',
      sections: [
        {
          id: 'sec-top-only',
          title: 'TOP / KURTI',
          sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
          measurements: [
            {
              id: 'm-st-1',
              label: 'Across Shoulder',
              inches: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' },
              cms: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' }
            },
            {
              id: 'm-st-2',
              label: 'Bust / Chest',
              inches: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' },
              cms: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' }
            },
            {
              id: 'm-st-3',
              label: 'Waist',
              inches: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' },
              cms: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' }
            },
            {
              id: 'm-st-4',
              label: 'Hips',
              inches: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' },
              cms: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' }
            },
            {
              id: 'm-st-5',
              label: 'Garment Length',
              inches: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' },
              cms: { XS: '0', S: '0', M: '0', L: '0', XL: '0', '2XL': '0', '3XL': '0' }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'mens_kurta_pyjama',
    label: 'Men\'s Kurta & Pyjama Set',
    data: {
      enabled: true,
      title: 'Body Measurement',
      unitDefault: 'inch',
      sections: [
        {
          id: 'sec-m-kurta',
          title: 'KURTA (TOP)',
          sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
          measurements: [
            {
              id: 'm-mk-1',
              label: 'Chest',
              inches: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' },
              cms: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' }
            },
            {
              id: 'm-mk-2',
              label: 'Shoulder',
              inches: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' },
              cms: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' }
            },
            {
              id: 'm-mk-3',
              label: 'Kurta Length',
              inches: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' },
              cms: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' }
            },
            {
              id: 'm-mk-4',
              label: 'Sleeve Length',
              inches: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' },
              cms: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' }
            }
          ]
        },
        {
          id: 'sec-m-pyjama',
          title: 'PYJAMA / PANTS',
          sizes: ['38 (S)', '40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
          measurements: [
            {
              id: 'm-mp-1',
              label: 'Waist (Stretch)',
              inches: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' },
              cms: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' }
            },
            {
              id: 'm-mp-2',
              label: 'Length',
              inches: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' },
              cms: { '38 (S)': '0', '40 (M)': '0', '42 (L)': '0', '44 (XL)': '0', '46 (XXL)': '0' }
            }
          ]
        }
      ]
    }
  }
];

export const DEFAULT_SIZE_CHART = SIZE_CHART_PRESETS[0].data;

/**
 * Syncs an existing size chart with new product size columns.
 */
export function syncSizeChartWithSizes(currentChart, newSizes = []) {
  if (!currentChart || !Array.isArray(currentChart.sections) || currentChart.sections.length === 0) {
    const clone = JSON.parse(JSON.stringify(DEFAULT_SIZE_CHART));
    if (newSizes.length > 0) {
      clone.sections.forEach(sec => {
        sec.sizes = [...newSizes];
        if (Array.isArray(sec.measurements)) {
          sec.measurements.forEach(m => {
            m.inches = {};
            m.cms = {};
            newSizes.forEach(s => {
              m.inches[s] = '0';
              m.cms[s] = '0';
            });
          });
        }
      });
    }
    return clone;
  }

  const cleanSizes = newSizes.filter(Boolean);
  if (cleanSizes.length === 0) return currentChart;

  const clone = JSON.parse(JSON.stringify(currentChart));
  clone.sections.forEach(sec => {
    sec.sizes = [...cleanSizes];
    if (Array.isArray(sec.measurements)) {
      sec.measurements.forEach(m => {
        m.inches = m.inches || {};
        m.cms = m.cms || {};
        cleanSizes.forEach(s => {
          if (m.inches[s] === undefined || m.inches[s] === '') m.inches[s] = '0';
          if (m.cms[s] === undefined || m.cms[s] === '') m.cms[s] = '0';
        });
      });
    }
  });
  return clone;
}

/**
 * Returns a complete effective size chart for product viewing.
 */
export function getEffectiveSizeChart(product) {
  if (
    product?.sizeChart &&
    product.sizeChart.enabled !== false &&
    Array.isArray(product.sizeChart.sections) &&
    product.sizeChart.sections.length > 0
  ) {
    return product.sizeChart;
  }

  // Fallback preset tailored to product gender/category
  const isMen = product?.gender?.toLowerCase() === 'men';
  const isBlouse = product?.category?.toLowerCase().includes('blouse') || product?.name?.toLowerCase().includes('blouse');

  let basePreset = SIZE_CHART_PRESETS[0].data;
  if (isMen) {
    basePreset = SIZE_CHART_PRESETS[3].data;
  } else if (isBlouse) {
    basePreset = SIZE_CHART_PRESETS[1].data;
  }

  const clone = JSON.parse(JSON.stringify(basePreset));
  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    clone.sections.forEach(sec => {
      if (product.sizes.length >= 2) {
        sec.sizes = product.sizes;
        if (Array.isArray(sec.measurements)) {
          sec.measurements.forEach(m => {
            m.inches = m.inches || {};
            m.cms = m.cms || {};
            product.sizes.forEach(s => {
              if (m.inches[s] === undefined) m.inches[s] = '0';
              if (m.cms[s] === undefined) m.cms[s] = '0';
            });
          });
        }
      }
    });
  }

  return clone;
}
