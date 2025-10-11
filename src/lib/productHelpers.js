import productData from "@/data/product-data.json";

/**
 * Find product by ID from the product data
 * @param {string} id - The product ID
 * @returns {object|null} Product object or null if not found
 */
export function findProductById(id) {
  // Normalize the ID to match the format in product data
  const normalizedId = id.startsWith("product-") ? id : `product-${id}`;
  return productData.find((product) => product.id === normalizedId) || null;
}

/**
 * Calculate match score between user requirements and product attributes
 * @param {string[]} userTags - User's preferred tags
 * @param {string[]} productTags - Product tags
 * @param {object} productMetadata - Product metadata object
 * @returns {object} Match analysis with score and details
 */
export function calculateMatch(
  userTags = [],
  productTags = [],
  productMetadata = {}
) {
  if (!userTags.length) {
    return {
      score: 0,
      matches: [],
      additionalFeatures: productTags,
      matchPercentage: 0,
    };
  }

  // Find direct tag matches
  const directMatches = userTags.filter((tag) =>
    productTags.some(
      (productTag) =>
        productTag.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(productTag.toLowerCase())
    )
  );

  // Find metadata matches
  const metadataMatches = [];
  const metadataKeys = Object.keys(productMetadata);

  userTags.forEach((userTag) => {
    metadataKeys.forEach((key) => {
      const value = productMetadata[key];
      if (Array.isArray(value)) {
        if (
          value.some((v) => v.toLowerCase().includes(userTag.toLowerCase()))
        ) {
          metadataMatches.push(`${key}: ${value.join(", ")}`);
        }
      } else if (
        typeof value === "string" &&
        value.toLowerCase().includes(userTag.toLowerCase())
      ) {
        metadataMatches.push(`${key}: ${value}`);
      }
    });
  });

  const allMatches = [...directMatches, ...metadataMatches];
  const uniqueMatches = [...new Set(allMatches)];

  // Calculate score based on matches vs total user requirements
  const matchPercentage = Math.round(
    (uniqueMatches.length / userTags.length) * 100
  );

  // Additional features not requested by user
  const additionalFeatures = productTags.filter(
    (tag) =>
      !userTags.some(
        (userTag) =>
          tag.toLowerCase().includes(userTag.toLowerCase()) ||
          userTag.toLowerCase().includes(tag.toLowerCase())
      )
  );

  return {
    score: uniqueMatches.length,
    matches: uniqueMatches,
    additionalFeatures,
    matchPercentage: Math.min(matchPercentage, 100),
  };
}

/**
 * Parse user requirements from URL search parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {object} Parsed user requirements
 */
export function parseUrlTags(searchParams) {
  const userTags =
    searchParams
      .get("userTags")
      ?.split(",")
      .map((tag) => tag.trim()) || [];
  const occasion = searchParams.get("occasion") || "";
  const style = searchParams.get("style") || "";
  const budget = searchParams.get("budget") || "";

  return {
    userTags,
    occasion,
    style,
    budget,
    allTags: [...userTags, occasion, style, budget].filter(Boolean),
  };
}

/**
 * Format price for display
 * @param {number} price - Raw price number
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get product category display name
 * @param {string} category - Product category
 * @returns {string} Formatted category name
 */
export function getCategoryDisplayName(category) {
  const categoryMap = {
    Earring: "Earrings",
    Ring: "Rings",
    Pendant: "Pendants",
    Bracelet: "Bracelets",
    Necklace: "Necklaces",
  };

  return categoryMap[category] || category;
}

/**
 * Get style intensity description
 * @param {number} intensity - Style intensity score (1-10)
 * @returns {string} Description of style intensity
 */
export function getStyleIntensityDescription(intensity) {
  if (intensity <= 3) return "Subtle & Minimal";
  if (intensity <= 5) return "Moderate & Balanced";
  if (intensity <= 7) return "Bold & Statement";
  if (intensity <= 9) return "Dramatic & Eye-catching";
  return "Ultra-dramatic & Show-stopping";
}

/**
 * Get formality level description
 * @param {number} formality - Formality level (1-10)
 * @returns {string} Description of formality level
 */
export function getFormalityDescription(formality) {
  if (formality <= 3) return "Casual & Everyday";
  if (formality <= 5) return "Smart Casual";
  if (formality <= 7) return "Semi-formal";
  if (formality <= 9) return "Formal & Elegant";
  return "Ultra-formal & Black-tie";
}
