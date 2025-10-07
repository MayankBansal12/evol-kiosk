"use server";

import { JEWELLERY_STYLIST_PROMPT } from "./prompts";

/**
 * Server action to interact with Gemini AI
 */
export async function getAIResponse(messages, userName) {
  try {
    const USE_MOCK_DATA =
      process.env.USE_MOCK_DATA === "true" || !process.env.GEMINI_API_KEY;

    console.log("Environment variables:", {
      useMockData: process.env.USE_MOCK_DATA,
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });

    if (USE_MOCK_DATA) {
      // Use simulated responses for development or when API key is not available
      console.log("Using mock data for AI responses");

      // Initialize response structure
      let response = {
        content: "",
        type: "question",
      };

      // Determine if we should show products or continue asking questions
      const shouldShowProducts = shouldGenerateProducts(messages);

      if (shouldShowProducts) {
        // Generate product recommendations
        response = generateProductRecommendations(messages, userName);
      } else {
        // Generate next conversation question
        response = generateNextQuestion(messages, userName);
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      return { success: true, data: response };
    } else {
      // Use actual Gemini API
      console.log("Calling Gemini API with conversation context");

      // Call Gemini API with the conversation and prompt
      const apiResponse = await callGeminiAPI(messages, userName);

      return { success: true, data: apiResponse };
    }
  } catch (error) {
    console.error("Error in AI processing:", error);
    return {
      success: false,
      error:
        "We encountered an issue with our styling assistant. Please try again.",
    };
  }
}

function extractUserName(messages) {
  return messages?.[0]?.metadata.name ?? "";
}

/**
 * Determine if enough context has been gathered to show products
 */
function shouldGenerateProducts(messages) {
  // Count user messages (each user choice)
  const userMsgCount = messages.filter((msg) => msg.role === "user").length;

  // If we have enough context (5+ responses), we can show products
  if (userMsgCount >= 5) return true;

  // Check for specific user requests for recommendations
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
      content: `Hello${personalizedGreeting}! I'm your jewelry stylist today. May I ask who you're looking to buy jewelry for?`,
      type: "question",
      options: [
        { value: "self", label: "For myself" },
        { value: "partner", label: "For my partner" },
        { value: "family", label: "For a family member" },
        { value: "friend", label: "For a friend" },
        { value: "other", label: "Someone else" },
      ],
    };
  }

  // Follow-up questions based on what hasn't been asked yet
  if (!hasAskedAboutType) {
    return {
      content: `Wonderful${personalizedGreeting}! What type of jewelry piece are you interested in today?`,
      type: "question",
      options: [
        { value: "ring", label: "Ring" },
        { value: "necklace", label: "Necklace" },
        { value: "bracelet", label: "Bracelet" },
        { value: "earrings", label: "Earrings" },
        { value: "watch", label: "Watch" },
        { value: "other", label: "Something else" },
      ],
    };
  }

  if (!hasAskedAboutOccasion) {
    return {
      content: `Excellent choice! And what's the occasion you're shopping for?`,
      type: "question",
      options: [
        { value: "everyday", label: "Everyday wear" },
        { value: "special", label: "Special occasion" },
        { value: "wedding", label: "Wedding" },
        { value: "engagement", label: "Engagement" },
        { value: "anniversary", label: "Anniversary" },
        { value: "gift", label: "Birthday/Gift" },
      ],
    };
  }

  if (!hasAskedAboutBudget) {
    return {
      content: `And what price range are you considering for this piece?`,
      type: "question",
      options: [
        { value: "budget", label: "Under $500" },
        { value: "mid-range", label: "$500 - $2,000" },
        { value: "premium", label: "$2,000 - $5,000" },
        { value: "luxury", label: "Over $5,000" },
      ],
    };
  }

  if (!hasAskedAboutStyle) {
    return {
      content: `Thank you! Now, which style do you find yourself drawn to?`,
      type: "question",
      options: [
        { value: "classic", label: "Classic & Timeless" },
        { value: "modern", label: "Modern & Contemporary" },
        { value: "vintage", label: "Vintage & Antique" },
        { value: "minimal", label: "Minimal & Clean" },
        { value: "statement", label: "Bold & Statement" },
      ],
    };
  }

  // Default question if all basic questions have been asked
  return {
    content: `Thank you for sharing your preferences${personalizedGreeting}! I think I have enough to suggest some beautiful pieces for you. Would you like to see my recommendations?`,
    type: "question",
    options: [
      { value: "show-recommendations", label: "Show me recommendations" },
      { value: "more-questions", label: "Ask me more questions" },
    ],
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

  // Generate mock product recommendations based on preferences
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
function getMockProducts(jewelryType, style, priceRange) {
  // Mock product database
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

  // Return products that match the type and style
  return products[jewelryType][style];
}

/**
 * Implementation of the Gemini API integration using the 2.5 Flash Lite model
 */
async function callGeminiAPI(messages, userName) {
  // Format the conversation for the API
  const formattedMessages = formatMessagesForGemini(messages, userName);
  const apiEndpoint = "";

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                JEWELLERY_STYLIST_PROMPT +
                "\n\nConversation context:\n" +
                JSON.stringify(formattedMessages),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    }),
  });

  // Parse the response
  const result = await response.json();

  if (!result.candidates || result.candidates.length === 0) {
    console.error("Gemini API error:", result.error || "Unknown error");
    throw new Error("Failed to get response from Gemini API");
  }

  // Extract the text response
  const textResponse = result.candidates[0].content.parts[0].text;

  // Parse the response to get structured data
  return parseGeminiResponse(textResponse);
}

/**
 * Format messages for the Gemini API
 */
function formatMessagesForGemini(messages, userName) {
  // Filter out system messages and format for Gemini
  const formattedMessages = messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  // Add user name as metadata
  const contextWithMetadata = {
    messages: formattedMessages,
    metadata: {
      userName: userName || "",
    },
  };

  return contextWithMetadata;
}

/**
 * Parse the Gemini API response to extract structured data
 */
function parseGeminiResponse(textResponse) {
  try {
    // Look for JSON in the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      // Found JSON, parse it
      const jsonResponse = JSON.parse(jsonMatch[0]);

      // Check if response contains products
      if (jsonResponse.type === "products" && jsonResponse.products) {
        return {
          content:
            jsonResponse.content || "Here are some pieces I think you'll love.",
          type: "products",
          products: jsonResponse.products,
          tags: jsonResponse.tags || [],
        };
      } else {
        // It's a question
        return {
          content:
            jsonResponse.content ||
            "What would you like to know about jewellery?",
          type: "question",
          options: jsonResponse.options || [
            { value: "continue", label: "Continue" },
            { value: "restart", label: "Start over" },
          ],
        };
      }
    } else {
      // No JSON found, use the text as a question
      return {
        content:
          textResponse.split("\n")[0] ||
          "What would you like to know about jewellery?",
        type: "question",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "more", label: "Tell me more" },
          { value: "show", label: "Show me options" },
        ],
      };
    }
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Fallback to a simple question
    return {
      content:
        "I'm not sure I understood. Would you like to see some jewellery options?",
      type: "question",
      options: [
        { value: "yes", label: "Yes, show me options" },
        { value: "no", label: "No, ask me something else" },
      ],
    };
  }
}
