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
  if (userMsgCount >= 5) return true;
  const lastUserMsg =
    messages.filter((msg) => msg.role === "user").pop()?.content || "";
  return (
    lastUserMsg.toLowerCase().includes("recommend") ||
    lastUserMsg.toLowerCase().includes("show me") ||
    lastUserMsg.toLowerCase().includes("suggestions")
  );
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
      msg.content.toLowerCase().includes("piece"),
  );

  const hasAskedAboutOccasion = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("occasion") ||
      msg.content.toLowerCase().includes("event"),
  );

  const hasAskedAboutRecipient = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("who") ||
      msg.content.toLowerCase().includes("recipient"),
  );

  const hasAskedAboutBudget = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("budget") ||
      msg.content.toLowerCase().includes("price") ||
      msg.content.toLowerCase().includes("spend"),
  );

  const hasAskedAboutStyle = assistantMessages.some(
    (msg) =>
      msg.content.toLowerCase().includes("style") ||
      msg.content.toLowerCase().includes("design"),
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
    content: `Thank you for sharing your preferences${personalizedGreeting}! I think I have enough to suggest some beautiful pieces for you. Would you like to see my recommendations?`,
    type: "question",
    options: ["show-recommendations", "more-questions"],
  };
}

/**
 * Generate product recommendations based on conversation context
 */
function generateProductRecommendations(messages, userName) {
  const userMessages = messages.filter((msg) => msg.role === "user");
  const personalizedGreeting = userName ? `, ${userName}` : "";

  // Analyze conversation to determine preferences
  const jewelryType = determinePreference(messages, "type", "necklace");
  const style = determinePreference(messages, "style", "classic");
  const priceRange = determinePreference(messages, "budget", "mid-range");

  const products = getMockProducts(jewelryType, style, priceRange);
  return {
    content: `I think you'll love these pieces${personalizedGreeting}. They perfectly match your style preferences.`,
    type: "products",
    products: products,
    tags: [jewelryType, style, priceRange],
  };
}

/**
 * Determine user preference from conversation
 */
function determinePreference(messages, preferenceType, defaultValue) {
  const userMessages = messages.filter((msg) => msg.role === "user");

  // Type preferences
  if (preferenceType === "type") {
    if (userMessages.some((msg) => msg.content.toLowerCase().includes("ring")))
      return "ring";
    if (
      userMessages.some((msg) => msg.content.toLowerCase().includes("necklace"))
    )
      return "necklace";
    if (
      userMessages.some((msg) => msg.content.toLowerCase().includes("bracelet"))
    )
      return "bracelet";
    if (
      userMessages.some((msg) => msg.content.toLowerCase().includes("earring"))
    )
      return "earrings";
    if (userMessages.some((msg) => msg.content.toLowerCase().includes("watch")))
      return "watch";
  }

  // Style preferences
  if (preferenceType === "style") {
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("classic") ||
          msg.content.toLowerCase().includes("timeless"),
      )
    )
      return "classic";
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("modern") ||
          msg.content.toLowerCase().includes("contemporary"),
      )
    )
      return "modern";
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("vintage") ||
          msg.content.toLowerCase().includes("antique"),
      )
    )
      return "vintage";
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("minimal") ||
          msg.content.toLowerCase().includes("simple"),
      )
    )
      return "minimal";
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("statement") ||
          msg.content.toLowerCase().includes("bold"),
      )
    )
      return "statement";
  }

  // Budget preferences
  if (preferenceType === "budget") {
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("under $500") ||
          msg.content.toLowerCase().includes("budget"),
      )
    )
      return "budget";
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("$500") ||
          msg.content.toLowerCase().includes("$2,000"),
      )
    )
      return "mid-range";
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("$2,000") ||
          msg.content.toLowerCase().includes("$5,000"),
      )
    )
      return "premium";
    if (
      userMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("over $5,000") ||
          msg.content.toLowerCase().includes("luxury"),
      )
    )
      return "luxury";
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
