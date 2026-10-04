/**
 * Size Chart Presets & Measurement Helpers for Chennai Silk Palace
 * Supports dual-unit (inch and cm) body measurements & product dimensions.
 */

export function inchToCm(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return (num * 2.54).toFixed(1).replace(/\.0$/, '');
}

export function cmToInch(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
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
              inches: { S: '14', M: '14.5', L: '15', XL: '15.5', XXL: '16' },
              cms: { S: '35.6', M: '36.8', L: '38.1', XL: '39.4', XXL: '40.6' }
            },
            {
              id: 'm-top-2',
              label: 'Bust',
              inches: { S: '36', M: '38', L: '40', XL: '42', XXL: '44' },
              cms: { S: '91.4', M: '96.5', L: '101.6', XL: '106.7', XXL: '111.8' }
            },
            {
              id: 'm-top-3',
              label: 'Hips',
              inches: { S: '38', M: '40', L: '42', XL: '44', XXL: '46' },
              cms: { S: '96.5', M: '101.6', L: '106.7', XL: '111.8', XXL: '116.8' }
            },
            {
              id: 'm-top-4',
              label: 'Waist',
              inches: { S: '32', M: '34', L: '36', XL: '38', XXL: '40' },
              cms: { S: '81.3', M: '86.4', L: '91.4', XL: '96.5', XXL: '101.6' }
            },
            {
              id: 'm-top-5',
              label: 'Front Length',
              inches: { S: '46', M: '46', L: '46', XL: '46', XXL: '46' },
              cms: { S: '116.8', M: '116.8', L: '116.8', XL: '116.8', XXL: '116.8' }
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
              inches: { S: '29', M: '30', L: '32', XL: '33', XXL: '33.5' },
              cms: { S: '73.7', M: '76.2', L: '81.3', XL: '83.8', XXL: '85.1' }
            },
            {
              id: 'm-bot-2',
              label: 'Outseam Length',
              inches: { S: '38', M: '38', L: '38', XL: '38', XXL: '38' },
              cms: { S: '96.5', M: '96.5', L: '96.5', XL: '96.5', XXL: '96.5' }
            },
            {
              id: 'm-bot-3',
              label: 'Inseam Length',
              inches: { S: '26', M: '26', L: '26', XL: '26', XXL: '26' },
              cms: { S: '66.0', M: '66.0', L: '66.0', XL: '66.0', XXL: '66.0' }
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
              inches: { '32': '32', '34': '34', '36': '36', '38': '38', '40': '40', '42': '42', '44': '44' },
              cms: { '32': '81.3', '34': '86.4', '36': '91.4', '38': '96.5', '40': '101.6', '42': '106.7', '44': '111.8' }
            },
            {
              id: 'm-bl-2',
              label: 'Underbust (Waist)',
              inches: { '32': '26', '34': '28', '36': '30', '38': '32', '40': '34', '42': '36', '44': '38' },
              cms: { '32': '66.0', '34': '71.1', '36': '76.2', '38': '81.3', '40': '86.4', '42': '91.4', '44': '96.5' }
            },
            {
              id: 'm-bl-3',
              label: 'Shoulder',
              inches: { '32': '13.5', '34': '14', '36': '14.5', '38': '15', '40': '15.5', '42': '16', '44': '16.5' },
              cms: { '32': '34.3', '34': '35.6', '36': '36.8', '38': '38.1', '40': '39.4', '42': '40.6', '44': '41.9' }
            },
            {
              id: 'm-bl-4',
              label: 'Blouse Length',
              inches: { '32': '14', '34': '14', '36': '14.5', '38': '15', '40': '15', '42': '15.5', '44': '15.5' },
              cms: { '32': '35.6', '34': '35.6', '36': '36.8', '38': '38.1', '40': '38.1', '42': '39.4', '44': '39.4' }
            },
            {
              id: 'm-bl-5',
              label: 'Armhole',
              inches: { '32': '14', '34': '15', '36': '16', '38': '17', '40': '18', '42': '19', '44': '20' },
              cms: { '32': '35.6', '34': '38.1', '36': '40.6', '38': '43.2', '40': '45.7', '42': '48.3', '44': '50.8' }
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
              inches: { XS: '13.5', S: '14', M: '14.5', L: '15', XL: '15.5', '2XL': '16', '3XL': '16.5' },
              cms: { XS: '34.3', S: '35.6', M: '36.8', L: '38.1', XL: '39.4', '2XL': '40.6', '3XL': '41.9' }
            },
            {
              id: 'm-st-2',
              label: 'Bust / Chest',
              inches: { XS: '34', S: '36', M: '38', L: '40', XL: '42', '2XL': '44', '3XL': '46' },
              cms: { XS: '86.4', S: '91.4', M: '96.5', L: '101.6', XL: '106.7', '2XL': '111.8', '3XL': '116.8' }
            },
            {
              id: 'm-st-3',
              label: 'Waist',
              inches: { XS: '30', S: '32', M: '34', L: '36', XL: '38', '2XL': '40', '3XL': '42' },
              cms: { XS: '76.2', S: '81.3', M: '86.4', L: '91.4', XL: '96.5', '2XL': '101.6', '3XL': '106.7' }
            },
            {
              id: 'm-st-4',
              label: 'Hips',
              inches: { XS: '36', S: '38', M: '40', L: '42', XL: '44', '2XL': '46', '3XL': '48' },
              cms: { XS: '91.4', S: '96.5', L: '101.6', XL: '106.7', '2XL': '111.8', '3XL': '116.8', '3XL': '121.9' }
            },
            {
              id: 'm-st-5',
              label: 'Garment Length',
              inches: { XS: '44', S: '44', M: '45', L: '45', XL: '46', '2XL': '46', '3XL': '46' },
              cms: { XS: '111.8', S: '111.8', M: '114.3', L: '114.3', XL: '116.8', '2XL': '116.8', '3XL': '116.8' }
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
              inches: { '38 (S)': '38', '40 (M)': '40', '42 (L)': '42', '44 (XL)': '44', '46 (XXL)': '46' },
              cms: { '38 (S)': '96.5', '40 (M)': '101.6', '42 (L)': '106.7', '44 (XL)': '111.8', '46 (XXL)': '116.8' }
            },
            {
              id: 'm-mk-2',
              label: 'Shoulder',
              inches: { '38 (S)': '17.5', '40 (M)': '18', '42 (L)': '18.5', '44 (XL)': '19', '46 (XXL)': '19.5' },
              cms: { '38 (S)': '44.5', '40 (M)': '45.7', '42 (L)': '47.0', '44 (XL)': '48.3', '46 (XXL)': '49.5' }
            },
            {
              id: 'm-mk-3',
              label: 'Kurta Length',
              inches: { '38 (S)': '40', '40 (M)': '42', '42 (L)': '44', '44 (XL)': '44', '46 (XXL)': '45' },
              cms: { '38 (S)': '101.6', '40 (M)': '106.7', '42 (L)': '111.8', '44 (XL)': '111.8', '46 (XXL)': '114.3' }
            },
            {
              id: 'm-mk-4',
              label: 'Sleeve Length',
              inches: { '38 (S)': '24.5', '40 (M)': '25', '42 (L)': '25.5', '44 (XL)': '26', '46 (XXL)': '26.5' },
              cms: { '38 (S)': '62.2', '40 (M)': '63.5', '42 (L)': '64.8', '44 (XL)': '66.0', '46 (XXL)': '67.3' }
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
              inches: { '38 (S)': '30-34', '40 (M)': '32-36', '42 (L)': '34-38', '44 (XL)': '36-40', '46 (XXL)': '38-42' },
              cms: { '38 (S)': '76-86', '40 (M)': '81-91', '42 (L)': '86-96', '44 (XL)': '91-101', '46 (XXL)': '96-106' }
            },
            {
              id: 'm-mp-2',
              label: 'Length',
              inches: { '38 (S)': '40', '40 (M)': '41', '42 (L)': '42', '44 (XL)': '42', '46 (XXL)': '43' },
              cms: { '38 (S)': '101.6', '40 (M)': '104.1', '42 (L)': '106.7', '44 (XL)': '106.7', '46 (XXL)': '109.2' }
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
      });
    }
    return clone;
  }

  const cleanSizes = newSizes.filter(Boolean);
  if (cleanSizes.length === 0) return currentChart;

  const clone = JSON.parse(JSON.stringify(currentChart));
  clone.sections.forEach(sec => {
    sec.sizes = [...cleanSizes];
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
      // If sizes match standard, keep; otherwise adapt
      if (product.sizes.length >= 2) {
        sec.sizes = product.sizes;
      }
    });
  }

  return clone;
}
