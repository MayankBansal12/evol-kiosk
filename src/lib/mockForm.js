/**
 * Generate fallback response
 */
export function generateMockResponse(messages, userName) {
  // Determine if we should show products or continue asking questions
  const shouldShowProducts = shouldGenerateProducts(messages);

  if (!shouldShowProducts) {
    return generateNextQuestion(messages, userName);
  }
  return generateProductRecommendations(messages, userName);
}

/**
 * Determine if enough context has been gathered to show products
 */
function shouldGenerateProducts(messages) {
  const userMsgCount = messages.filter((msg) => msg.role === "user").length;
  const lastUserMsg =
    messages.filter((msg) => msg.role === "user").pop()?.content || "";

  // Check for explicit requests to see products
  const explicitRequests = [
    "show me options",
    "show me products",
    "show me jewelry",
    "show me pieces",
    "recommend",
    "suggestions",
    "yes, show me options",
    "yes show me options",
  ];

  const hasExplicitRequest = explicitRequests.some((request) =>
    lastUserMsg.toLowerCase().includes(request.toLowerCase())
  );

  // Show products if user explicitly requests OR if we have enough context (3+ messages)
  return hasExplicitRequest || userMsgCount >= 3;
}

/**
 * Generate next question based on conversation context
 */
function generateNextQuestion(messages, userName) {
  const userMessages = messages.filter((msg) => msg.role === "user");
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");
  const personalizedGreeting = userName ? `, ${userName}` : "";

  // Determine which questions have been asked/answered
  const hasAskedAboutType = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("type") ||
      msg.content.toLowerCase().includes("piece")
  );

  const hasAskedAboutOccasion = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("occasion") ||
      msg.content.toLowerCase().includes("event")
  );

  const hasAskedAboutBudget = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("budget") ||
      msg.content.toLowerCase().includes("price") ||
      msg.content.toLowerCase().includes("spend")
  );

  const hasAskedAboutStyle = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("style") ||
      msg.content.toLowerCase().includes("design")
  );

  // First message - introduction
  if (userMessages.length === 0) {
    return {
      content: `Hello${personalizedGreeting}! I am Evol-e. May I ask who you're looking to buy jewelry for?`,
      type: "question",
      options: ["self", "partner", "family", "friend", "other"],
    };
  }

  // Follow-up questions based on what hasn't been asked yet
  if (!hasAskedAboutType) {
    return {
      content: `Wonderful${personalizedGreeting}! What type of jewelry piece are you interested in today?`,
      type: "question",
      options: ["ring", "necklace", "bracelet", "earrings", "watch", "other"],
    };
  }

  if (!hasAskedAboutOccasion) {
    return {
      content: `Excellent choice! And what's the occasion you're shopping for?`,
      type: "question",
      options: [
        "everyday",
        "special",
        "wedding",
        "engagement",
        "anniversary",
        "gift",
      ],
    };
  }

  if (!hasAskedAboutBudget) {
    return {
      content: `And what price range are you considering for this piece?`,
      type: "question",
      options: ["budget", "mid-range", "premium", "luxury"],
    };
  }

  if (!hasAskedAboutStyle) {
    return {
      content: `Thank you! Now, which style do you find yourself drawn to?`,
      type: "question",
      options: ["classic", "modern", "vintage", "minimal", "statement"],
    };
  }

  return {
    content: `Perfect${personalizedGreeting}! I have a wonderful selection of pieces that match your style. Would you like to see my recommendations?`,
    type: "question",
    options: ["Yes, show me options", "Tell me more about the pieces"],
  };
}

/**
 * Generate product recommendations based on conversation context
 */
function generateProductRecommendations(messages, userName) {
  const personalizedGreeting = userName ? `, ${userName}` : "";

  // Analyze conversation to determine preferences
  const jewelryType = determinePreference(messages, "type", "necklace");
  const style = determinePreference(messages, "style", "classic");
  const priceRange = determinePreference(messages, "budget", "mid-range");

  // Generate tags and metadata based on preferences
  const tags = generateTagsFromPreferences(jewelryType, style, priceRange);
  const metadata = generateMetadataFromPreferences(
    jewelryType,
    style,
    priceRange
  );

  const products = getMockProducts(jewelryType, style, priceRange);
  return {
    content: `I think you'll love these pieces${personalizedGreeting}. They perfectly match your style preferences.`,
    type: "products",
    products: products,
    tags: tags,
    metadata: metadata,
  };
}

/**
 * Generate tags based on user preferences
 */
function generateTagsFromPreferences(jewelryType, style, priceRange) {
  const tags = [];

  // Add style-based tags
  if (style === "classic") tags.push("classic", "elegant", "timeless");
  if (style === "modern") tags.push("modern", "contemporary", "geometric");
  if (style === "vintage") tags.push("vintage", "romantic", "artistic");
  if (style === "minimal") tags.push("minimalist", "delicate", "everyday");
  if (style === "statement") tags.push("statement", "bold", "dramatic");

  // Add price range tags
  if (priceRange === "budget") tags.push("mid-range");
  if (priceRange === "luxury") tags.push("luxury", "ultra-luxury");

  // Add jewelry type specific tags
  if (jewelryType === "ring") tags.push("romantic", "special-occasion");
  if (jewelryType === "necklace") tags.push("elegant", "feminine");
  if (jewelryType === "earrings") tags.push("delicate", "artistic");

  return tags;
}

/**
 * Generate metadata based on user preferences
 */
function generateMetadataFromPreferences(jewelryType, style, priceRange) {
  const metadata = {};

  // Formality level based on style and occasion
  if (style === "classic" || style === "statement") {
    metadata.formality_level = [7, 8, 9];
  } else if (style === "modern") {
    metadata.formality_level = [5, 6, 7];
  } else {
    metadata.formality_level = [3, 4, 5];
  }

  // Style intensity based on preference
  if (style === "statement") {
    metadata.style_intensity = [8, 9, 10];
  } else if (style === "modern") {
    metadata.style_intensity = [6, 7, 8];
  } else {
    metadata.style_intensity = [3, 4, 5];
  }

  // Age group (infer from style preferences)
  metadata.age_group = ["adult", "mature"];

  // Outfit style based on formality
  if (metadata.formality_level[0] >= 7) {
    metadata.outfit_style = ["formal", "special-occasion", "evening"];
  } else if (metadata.formality_level[0] >= 5) {
    metadata.outfit_style = ["business", "evening", "special-occasion"];
  } else {
    metadata.outfit_style = ["casual", "everyday", "work"];
  }

  // Materials based on price range
  if (priceRange === "luxury") {
    metadata.materials = ["diamond", "gold"];
    metadata.investment_value = ["high", "very-high"];
  } else {
    metadata.materials = ["diamond", "gold"];
    metadata.investment_value = ["medium", "high"];
  }

  return metadata;
}

/**
 * Determine user preference from conversation
 */
function determinePreference(messages, preferenceType, defaultValue) {
  const userMessages = messages.filter((msg) => msg.role === "user");

  if (preferenceType === "type") {
    return determineJewelryType(userMessages, defaultValue);
  }

  if (preferenceType === "style") {
    return determineStyle(userMessages, defaultValue);
  }

  if (preferenceType === "budget") {
    return determineBudget(userMessages, defaultValue);
  }

  return defaultValue;
}

/**
 * Determine jewelry type preference
 */
function determineJewelryType(userMessages, defaultValue) {
  const typeKeywords = {
    ring: ["ring"],
    necklace: ["necklace"],
    bracelet: ["bracelet"],
    earrings: ["earring"],
    watch: ["watch"],
  };

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (
      userMessages.some((msg) =>
        keywords.some((keyword) => msg.content.toLowerCase().includes(keyword))
      )
    ) {
      return type;
    }
  }

  return defaultValue;
}

/**
 * Determine style preference
 */
function determineStyle(userMessages, defaultValue) {
  const styleKeywords = {
    classic: ["classic", "timeless"],
    modern: ["modern", "contemporary"],
    vintage: ["vintage", "antique"],
    minimal: ["minimal", "simple"],
    statement: ["statement", "bold"],
  };

  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (
      userMessages.some((msg) =>
        keywords.some((keyword) => msg.content.toLowerCase().includes(keyword))
      )
    ) {
      return style;
    }
  }

  return defaultValue;
}

/**
 * Determine budget preference
 */
function determineBudget(userMessages, defaultValue) {
  const budgetKeywords = {
    budget: ["under $500", "budget"],
    "mid-range": ["$500", "$2,000"],
    premium: ["$2,000", "$5,000"],
    luxury: ["over $5,000", "luxury"],
  };

  for (const [budget, keywords] of Object.entries(budgetKeywords)) {
    if (
      userMessages.some((msg) =>
        keywords.some((keyword) => msg.content.toLowerCase().includes(keyword))
      )
    ) {
      return budget;
    }
  }

  return defaultValue;
}

/**
 * Get mock products based on user preferences
 */
export function getMockProducts(jewelryType, style, priceRange) {
  const products = {
    ring: {
      classic: [
        {
          id: "r1",
          name: "Classic Diamond Solitaire Ring",
          price: "$2,495",
          image: "/product-ring.jpg",
          description: "Timeless elegance with a brilliant cut diamond",
        },
        {
          id: "r2",
          name: "Gold Band Ring",
          price: "$895",
          image: "/product-ring.jpg",
          description: "Simple and elegant 18k gold band",
        },
      ],
      modern: [
        {
          id: "r3",
          name: "Geometric Diamond Ring",
          price: "$1,995",
          image: "/product-ring.jpg",
          description: "Contemporary design with geometric settings",
        },
      ],
    },
    necklace: {
      classic: [
        {
          id: "n1",
          name: "Elegant Gold Chain Necklace",
          price: "$1,295",
          image: "/product-necklace.jpg",
          description: "Sophisticated 18k gold chain with delicate pendant",
        },
        {
          id: "n2",
          name: "Pearl Pendant Necklace",
          price: "$895",
          image: "/product-necklace.jpg",
          description: "Lustrous pearl on a delicate gold chain",
        },
      ],
      modern: [
        {
          id: "n3",
          name: "Geometric Pendant Necklace",
          price: "$1,195",
          image: "/product-necklace.jpg",
          description: "Bold geometric design with mixed metals",
        },
      ],
    },
    earrings: {
      classic: [
        {
          id: "e1",
          name: "Pearl Drop Earrings",
          price: "$895",
          image: "/product-earrings.jpg",
          description: "Lustrous pearls set in premium gold settings",
        },
        {
          id: "e2",
          name: "Diamond Stud Earrings",
          price: "$1,495",
          image: "/product-earrings.jpg",
          description: "Classic diamond studs for everyday elegance",
        },
      ],
      modern: [
        {
          id: "e3",
          name: "Geometric Hoop Earrings",
          price: "$795",
          image: "/product-earrings.jpg",
          description: "Contemporary twist on classic hoops",
        },
      ],
    },
  };

  // Default to returning all products if specific type/style not found
  if (!products[jewelryType] || !products[jewelryType][style]) {
    return [
      {
        id: "1",
        name: "Classic Diamond Solitaire Ring",
        price: "$2,495",
        image: "/product-ring.jpg",
        description: "Timeless elegance with a brilliant cut diamond",
      },
      {
        id: "2",
        name: "Elegant Gold Chain Necklace",
        price: "$1,295",
        image: "/product-necklace.jpg",
        description: "Sophisticated 18k gold chain with delicate pendant",
      },
      {
        id: "3",
        name: "Pearl Drop Earrings",
        price: "$895",
        image: "/product-earrings.jpg",
        description: "Lustrous pearls set in premium gold settings",
      },
    ];
  }

  return products[jewelryType][style];
}
