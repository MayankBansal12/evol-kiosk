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
 * Filter products based on AI response tags and metadata
 * @param {string[]} aiTags - Tags from AI response
 * @param {object} aiMetadata - Metadata from AI response
 * @returns {object[]} Array of filtered products with match scores
 */
export function filterProductsByAIResponse(
  category = null,
  aiTags = [],
  aiMetadata = {},
) {
  // Step 1: Filter by category FIRST (highest priority)
  let categoryFiltered = productData;
  if (category) {
    categoryFiltered = productData.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase(),
    );

    // If no products match the category, log warning but continue
    if (categoryFiltered.length === 0) {
      console.warn(`No products found for category: ${category}`);
      categoryFiltered = productData; // Fallback to all products
    }
  }

  // Step 2: Apply tag/metadata matching on category-filtered results
  if (!aiTags.length && !Object.keys(aiMetadata).length) {
    return categoryFiltered.map((product) => ({
      ...product,
      matchScore: 0,
      matchPercentage: 0,
    }));
  }

  const filteredProducts = categoryFiltered.map((product) => {
    const matchResult = calculateMatch(
      aiTags,
      product.tags,
      product.metadata,
      aiMetadata,
    );
    return {
      ...product,
      matchScore: matchResult.score,
      matchPercentage: matchResult.matchPercentage,
      matchedTags: matchResult.matches,
      additionalFeatures: matchResult.additionalFeatures,
    };
  });

  // Step 3: Sort by match score (descending) and filter out products with 0% match
  return filteredProducts
    .filter((product) => product.matchPercentage > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate match score between user requirements and product attributes
 * @param {string[]} userTags - User's preferred tags
 * @param {string[]} productTags - Product tags
 * @param {object} productMetadata - Product metadata object
 * @param {object} userMetadata - User's preferred metadata
 * @returns {object} Match analysis with score and details
 */
export function calculateMatch(
  userTags = [],
  productTags = [],
  productMetadata = {},
  userMetadata = {},
) {
  if (!userTags.length && !Object.keys(userMetadata).length) {
    return {
      score: 0,
      matches: [],
      additionalFeatures: productTags,
      matchPercentage: 0,
    };
  }

  // Calculate tag matches
  const tagMatches = userTags.filter((tag) =>
    productTags.some(
      (productTag) =>
        productTag.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(productTag.toLowerCase()),
    ),
  );

  // Calculate metadata matches
  const metadataMatches = [];
  const userMetadataKeys = Object.keys(userMetadata);

  userMetadataKeys.forEach((key) => {
    const userValues = userMetadata[key];
    const productValue = productMetadata[key];

    // Helper function to safely convert to string and lowercase
    const safeStringify = (val) => {
      if (typeof val === "string") return val.toLowerCase();
      if (typeof val === "number") return val.toString();
      if (Array.isArray(val))
        return val.map((v) =>
          typeof v === "string" ? v.toLowerCase() : v.toString(),
        );
      return val ? val.toString().toLowerCase() : "";
    };

    if (Array.isArray(userValues) && Array.isArray(productValue)) {
      // Both are arrays - check for overlap
      const userStrings = userValues.map((v) => safeStringify(v));
      const productStrings = productValue.map((v) => safeStringify(v));

      const overlap = userStrings.filter((userVal) =>
        productStrings.some(
          (prodVal) => prodVal.includes(userVal) || userVal.includes(prodVal),
        ),
      );
      if (overlap.length > 0) {
        metadataMatches.push(`${key}: ${overlap.join(", ")}`);
      }
    } else if (Array.isArray(userValues) && !Array.isArray(productValue)) {
      // User has array, product has single value
      const userStrings = userValues.map((v) => safeStringify(v));
      const productString = safeStringify(productValue);

      if (
        userStrings.some(
          (userVal) =>
            productString.includes(userVal) || userVal.includes(productString),
        )
      ) {
        metadataMatches.push(`${key}: ${productValue}`);
      }
    } else if (!Array.isArray(userValues) && Array.isArray(productValue)) {
      // User has single value, product has array
      const userString = safeStringify(userValues);
      const productStrings = productValue.map((v) => safeStringify(v));

      if (
        productStrings.some(
          (prodVal) =>
            prodVal.includes(userString) || userString.includes(prodVal),
        )
      ) {
        metadataMatches.push(`${key}: ${userValues}`);
      }
    } else {
      // Both are single values
      const userString = safeStringify(userValues);
      const productString = safeStringify(productValue);

      if (
        productString.includes(userString) ||
        userString.includes(productString)
      ) {
        metadataMatches.push(`${key}: ${productValue}`);
      }
    }
  });

  // Calculate scores with equal weighting (50% tags, 50% metadata)
  const tagScore =
    userTags.length > 0 ? (tagMatches.length / userTags.length) * 50 : 0;
  const metadataScore =
    userMetadataKeys.length > 0
      ? (metadataMatches.length / userMetadataKeys.length) * 50
      : 0;

  const totalScore = tagScore + metadataScore;
  const matchPercentage = Math.round(totalScore);

  // Additional features not requested by user
  const additionalFeatures = productTags.filter(
    (tag) =>
      !userTags.some(
        (userTag) =>
          tag.toLowerCase().includes(userTag.toLowerCase()) ||
          userTag.toLowerCase().includes(tag.toLowerCase()),
      ),
  );

  return {
    score: Math.round(totalScore),
    matches: [...tagMatches, ...metadataMatches],
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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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
