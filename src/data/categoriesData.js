// categoriesData.js - Comprehensive Category Architecture

export const CATEGORY_TREE = {
  women: {
    id: 'women',
    label: 'WOMENS',
    navLabel: 'WOMEN',
    gender: 'Women',
    path: '/gender/women',
    groups: [
      {
        id: 'sarees',
        name: 'Sarees',
        items: [
          'Soft Silk & Pure Silks Sarees',
          'Wedding Silk Collection Sarees',
          'Kanchi Cotton & Silk Cotton Sarees',
          'Kalaivarnam Pattu & Tussar Silk Sarees',
          'Ethnic & Fancy Sarees'
        ]
      },
      {
        id: 'punjabi-suits',
        name: 'Ladies Punjabi Suits',
        items: [
          'Cotton Punjabi Suits',
          '3-Piece Catalog Punjabi Suits',
          'Boutique & Designer Punjabi Suits',
          'Unstitched Punjabi Suit Materials'
        ]
      },
      {
        id: 'ladies-lehengas',
        name: 'Ladies Lehengas',
        items: [
          'Designer Lehengas',
          'Semi Stitched Heavy Lehengas',
          'Aari Work Designer Lehengas',
          'Printed & Kalamkari Soft Silk Lehengas',
          'Raw Silk Bootie Lehengas',
          'Bridal Handwoven Silk Lehengas'
        ]
      }
    ]
  },
  men: {
    id: 'men',
    label: 'MENS',
    navLabel: 'MEN',
    gender: 'Men',
    path: '/gender/men',
    groups: [
      {
        id: 'pattu-shirts-dhoti',
        name: 'Pattu Shirts & Dhoti Sets',
        items: [
          'Kanchipuram Silk Dhoti & Shirt Set',
          'Manyavar Ivory White Kurta Pancha Set',
          'Uathayam Tissue Silk & Gold Jari Wedding Combo',
          'Japan Silk Dhoti Set',
          'Pattu Dhotis'
        ]
      },
      {
        id: 'short-kurtas',
        name: 'Kurtas - Short Kurtas',
        items: [
          'Classic Hip Length Kurti',
          'Pathani Short Kurta',
          'Asymmetric Short Kurta',
          'Denim / Linen Fusion Kurti'
        ]
      },
      {
        id: 'long-kurtas',
        name: 'Kurtas - Long Kurtas',
        items: [
          'Straight Cut Long Kurta',
          'Anarkali / Flared Long Kurta',
          'Angrakha Long Kurta',
          'Sherwani Style Kurta'
        ]
      },
      {
        id: 'wedding-sherwani',
        name: 'Wedding Sherwani',
        items: [
          'Classic Sherwani Set',
          'Achkan Model',
          'Indo-Western Fusion Sherwani',
          'Angrakha Style Sherwani',
          'Chipkan & Anarkali Model'
        ]
      }
    ]
  },
  kids: {
    id: 'kids',
    label: 'KIDS',
    navLabel: 'KIDS',
    gender: 'Kids',
    path: '/gender/kids',
    groups: [
      {
        id: 'boys-sherwani',
        name: 'Boys - Sherwani',
        items: [
          'Indo-Western Sherwani',
          'Achkan Model Sherwani',
          'Angrakha Style Sherwani',
          'Jacket Style Sherwani'
        ]
      },
      {
        id: 'boys-dhotis',
        name: 'Boys - Dhotis',
        items: [
          'Shirt & Dhoti Sets',
          'Kurta Dhoti Sets'
        ]
      },
      {
        id: 'girls-lehengas',
        name: 'Girls - Lehengas',
        items: [
          'Peplum Style Lehenga',
          'Crop Top & Panel Lehenga',
          'Kediya Style Flared Lehenga',
          'Kalamkari Print Soft Silk Lehenga'
        ]
      },
      {
        id: 'girls-pattu-pavadai',
        name: 'Girls - Pattu Pavadai Combo',
        items: [
          'Pure Kanchipuram Korvai Pavadai',
          'Puff Sleeve Traditional Pavadai',
          'Tissue Silk / Kalamkari Combo',
          'Langa Jacket / Coat Model'
        ]
      },
      {
        id: 'girls-chudi-salwar',
        name: 'Girls - Chudi & Salwar Suit',
        items: [
          'Anarkali Chudi Set',
          'Straight Cut Patiala Suit',
          'Sharara / Gharara Play Sets'
        ]
      }
    ]
  }
};

/**
 * Returns structured hierarchy for a given gender (Women | Men | Kids)
 */
export const getDepartmentHierarchy = (gender = 'Women') => {
  const g = (gender || 'Women').toLowerCase();
  if (g.includes('women') || g === 'female') return CATEGORY_TREE.women.groups;
  if (g.includes('men') || g === 'male') return CATEGORY_TREE.men.groups;
  if (g.includes('kid') || g.includes('boy') || g.includes('girl')) return CATEGORY_TREE.kids.groups;
  return CATEGORY_TREE.women.groups;
};

/**
 * Returns a flat list of all leaf categories in the system
 */
export const getAllCategoriesFlat = () => {
  const list = [];
  CATEGORY_TREE.women.groups.forEach(g => list.push(...g.items));
  CATEGORY_TREE.men.groups.forEach(g => list.push(...g.items));
  CATEGORY_TREE.kids.groups.forEach(g => list.push(...g.items));
  return Array.from(new Set(list));
};

/**
 * Returns a flat list of categories filtered by gender
 */
export const getCategoriesByGender = (gender) => {
  if (!gender || gender.toLowerCase() === 'all') {
    return getAllCategoriesFlat();
  }
  const groups = getDepartmentHierarchy(gender);
  const list = [];
  groups.forEach(g => list.push(...g.items));
  return Array.from(new Set(list));
};

/**
 * Given any category string, finds its gender, main group, and exact leaf name
 */
export const findCategoryHierarchy = (categoryName, currentGender = 'Women') => {
  if (!categoryName) {
    const defaultGroups = getDepartmentHierarchy(currentGender);
    return {
      gender: currentGender,
      mainCategory: defaultGroups[0].name,
      subCategory: defaultGroups[0].items[0]
    };
  }

  const query = categoryName.toLowerCase().trim();

  // Search across Women, Men, Kids
  const departments = [
    { key: 'Women', groups: CATEGORY_TREE.women.groups },
    { key: 'Men', groups: CATEGORY_TREE.men.groups },
    { key: 'Kids', groups: CATEGORY_TREE.kids.groups }
  ];

  for (const dept of departments) {
    for (const group of dept.groups) {
      // Direct group match
      if (group.name.toLowerCase() === query || query.includes(group.name.toLowerCase())) {
        return {
          gender: dept.key,
          mainCategory: group.name,
          subCategory: group.items[0]
        };
      }
      // Item match
      for (const item of group.items) {
        if (
          item.toLowerCase() === query ||
          item.toLowerCase().includes(query) ||
          query.includes(item.toLowerCase())
        ) {
          return {
            gender: dept.key,
            mainCategory: group.name,
            subCategory: item
          };
        }
      }
    }
  }

  // Fallback to current gender defaults
  const fallbackGroups = getDepartmentHierarchy(currentGender);
  return {
    gender: currentGender,
    mainCategory: fallbackGroups[0].name,
    subCategory: fallbackGroups[0].items[0]
  };
};

/**
 * Returns high-level category tabs for GenderCollectionPage
 */
export const getTopLevelCategoryTabs = (gender) => {
  const g = (gender || 'all').toLowerCase();
  if (g === 'women') {
    return [
      'All',
      'Sarees',
      'Ladies Punjabi Suits',
      'Ladies Lehengas',
      'Soft Silk & Pure Silks Sarees',
      'Wedding Silk Collection Sarees'
    ];
  }
  if (g === 'men') {
    return [
      'All',
      'Pattu Shirts & Dhoti Sets',
      'Kurtas - Short Kurtas',
      'Kurtas - Long Kurtas',
      'Wedding Sherwani'
    ];
  }
  if (g === 'kids') {
    return [
      'All',
      'Boys - Sherwani',
      'Boys - Dhotis',
      'Girls - Lehengas',
      'Girls - Pattu Pavadai Combo',
      'Girls - Chudi & Salwar Suit'
    ];
  }
  return [
    'All',
    'Sarees',
    'Ladies Lehengas',
    'Pattu Shirts & Dhoti Sets',
    'Wedding Sherwani',
    'Girls - Pattu Pavadai Combo'
  ];
};

/**
 * Returns structured optgroups for Admin Select / Filters
 */
export const getGroupedCategoriesForAdmin = () => {
  return [
    {
      group: "Women's Collection",
      gender: 'Women',
      items: getCategoriesByGender('Women')
    },
    {
      group: "Men's Collection",
      gender: 'Men',
      items: getCategoriesByGender('Men')
    },
    {
      group: "Kids' Collection",
      gender: 'Kids',
      items: getCategoriesByGender('Kids')
    }
  ];
};

// Lookup indexes for ultra-fast, accurate category matching
let _categoryLookups = null;
const getCategoryLookups = () => {
  if (_categoryLookups) return _categoryLookups;

  const itemToGroup = {};
  const groupByName = {};
  const itemGender = {};

  ['women', 'men', 'kids'].forEach(genderKey => {
    CATEGORY_TREE[genderKey].groups.forEach(grp => {
      const gLower = grp.name.toLowerCase().trim();
      const gId = (grp.id || '').toLowerCase().trim();
      groupByName[gLower] = grp;
      if (gId) groupByName[gId] = grp;
      itemGender[gLower] = genderKey;
      if (gId) itemGender[gId] = genderKey;

      grp.items.forEach(sub => {
        const sLower = sub.toLowerCase().trim();
        itemToGroup[sLower] = grp;
        itemGender[sLower] = genderKey;
      });
    });
  });

  _categoryLookups = { itemToGroup, groupByName, itemGender };
  return _categoryLookups;
};

// Legacy shorthand aliases in MongoDB
const LEGACY_CATEGORY_TO_GROUP_ID = {
  'soft silk': 'sarees',
  'kanchi cotton': 'sarees',
  'pure silk': 'sarees',
  'pattu dhoti': 'pattu-shirts-dhoti',
  'dhoti': 'pattu-shirts-dhoti',
};

/**
 * Smart matching function to check if a product belongs to a given category or main group
 */
export const isProductInCategory = (item, targetCategory) => {
  if (!item || !targetCategory) return false;
  const target = targetCategory.toLowerCase().trim();
  if (target === 'all') return true;

  const { itemToGroup, groupByName, itemGender } = getCategoryLookups();

  const itemGen = (item.gender || '').toLowerCase().trim();
  const targetGen = itemGender[target];

  // 1. Strict Department/Gender guard:
  // If target belongs explicitly to Men, Women, or Kids, product must match that department
  if (targetGen && itemGen) {
    if (targetGen === 'women' && itemGen !== 'women' && itemGen !== 'female') return false;
    if (targetGen === 'men' && itemGen !== 'men' && itemGen !== 'male') return false;
    if (targetGen === 'kids' && !itemGen.includes('kid') && !itemGen.includes('boy') && !itemGen.includes('girl')) return false;
  }

  const itemCat = (item.category || '').toLowerCase().trim();
  const itemName = (item.name || '').toLowerCase().trim();

  // Collect all category strings from item
  const itemCategoryStrings = [];
  if (itemCat) itemCategoryStrings.push(itemCat);

  if (Array.isArray(item.categories)) {
    item.categories.forEach(c => {
      if (typeof c === 'string' && c.trim()) {
        itemCategoryStrings.push(c.toLowerCase().trim());
      }
    });
  } else if (typeof item.categories === 'string' && item.categories.trim()) {
    itemCategoryStrings.push(item.categories.toLowerCase().trim());
  }

  // 2. Direct exact equality match
  if (itemCategoryStrings.some(c => c === target)) return true;

  // 3. Target is a Main Group (e.g. "Sarees", "Ladies Lehengas", "Pattu Shirts & Dhoti Sets", etc.)
  const targetGroup = groupByName[target];
  if (targetGroup) {
    // 3a. Check if any category on the product maps directly to this group
    for (const c of itemCategoryStrings) {
      const mappedGrp = itemToGroup[c];
      if (mappedGrp && (mappedGrp.id === targetGroup.id || mappedGrp.name.toLowerCase() === targetGroup.name.toLowerCase())) {
        return true;
      }
      if (LEGACY_CATEGORY_TO_GROUP_ID[c] === targetGroup.id) {
        return true;
      }
    }

    // 3b. If product already belongs explicitly to a DIFFERENT group in CATEGORY_TREE, do not falsely match via keywords
    const hasOtherGroupAssignment = itemCategoryStrings.some(c => {
      const otherGrp = itemToGroup[c];
      return otherGrp && otherGrp.id !== targetGroup.id;
    });
    if (hasOtherGroupAssignment) return false;

    // 3c. Heuristic keywords for products without explicit category tree match
    if (targetGroup.id === 'sarees') {
      const isOther = itemName.includes('lehenga') || itemName.includes('suit') || itemName.includes('dhoti') || itemName.includes('sherwani') || itemName.includes('pancha');
      if (!isOther && (itemName.includes('saare') || itemName.includes('saree') || itemCategoryStrings.some(c => c === 'soft silk' || c.includes('saree') || c.includes('pattu')))) {
        return true;
      }
    }
    if (targetGroup.id === 'ladies-lehengas' || targetGroup.id === 'girls-lehengas') {
      if (itemName.includes('lehenga') || itemName.includes('lahanga') || itemCategoryStrings.some(c => c.includes('lehenga'))) {
        return true;
      }
    }
    if (targetGroup.id === 'punjabi-suits' || targetGroup.id === 'girls-chudi-salwar') {
      if (itemName.includes('suit') || itemName.includes('salwar') || itemName.includes('chudi') || itemCategoryStrings.some(c => c.includes('suit') || c.includes('salwar'))) {
        return true;
      }
    }
    if (targetGroup.id === 'pattu-shirts-dhoti' || targetGroup.id === 'boys-dhotis') {
      if (itemName.includes('dhoti') || itemName.includes('pancha') || itemCategoryStrings.some(c => c.includes('dhoti') || c.includes('pancha') || c.includes('panche'))) {
        return true;
      }
    }
    if (targetGroup.id === 'wedding-sherwani' || targetGroup.id === 'boys-sherwani') {
      if (itemName.includes('sherwani') || itemCategoryStrings.some(c => c.includes('sherwani'))) {
        return true;
      }
    }
    if (targetGroup.id === 'short-kurtas' || targetGroup.id === 'long-kurtas') {
      if (itemName.includes('kurta') || itemName.includes('kurti') || itemCategoryStrings.some(c => c.includes('kurta') || c.includes('kurti'))) {
        return true;
      }
    }
    if (targetGroup.id === 'girls-pattu-pavadai') {
      if (itemName.includes('pavadai') || itemName.includes('pavada') || itemCategoryStrings.some(c => c.includes('pavadai'))) {
        return true;
      }
    }

    return false;
  }

  // 4. Target is a leaf subcategory
  // Legacy shorthand: "Soft Silk" matches "Soft Silk & Pure Silks Sarees"
  if (target === 'soft silk & pure silks sarees') {
    if (itemCategoryStrings.some(c => c === 'soft silk')) return true;
  }

  // Substring check with cross-type protection
  const subMatch = itemCategoryStrings.some(c => {
    if (c === target) return true;
    if (c.includes(target) || target.includes(c)) {
      if (target.includes('lehenga') && !c.includes('lehenga') && !itemName.includes('lehenga')) return false;
      if (target.includes('saree') && (c.includes('lehenga') || itemName.includes('lehenga'))) return false;
      return true;
    }
    return false;
  });

  return subMatch;
};


