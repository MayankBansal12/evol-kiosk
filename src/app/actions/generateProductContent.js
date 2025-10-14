"use server";

/**
 * Unified server action to generate both product description and personalized recommendation
 */
export async function generateProductContent(product, userContext) {
  try {
    const USE_MOCK_DATA =
      process.env.USE_MOCK_DATA === "true" || !process.env.GEMINI_API_KEY;

    if (!USE_MOCK_DATA) {
      console.log("Calling Gemini API for unified product content generation");

      const apiResponse = await callGeminiUnifiedAPI(product, userContext);
      return { success: true, data: apiResponse };
    }

    console.log("Using mock data for unified product content");
    // Mock response for both description and recommendation
    const mockContent = generateMockProductContent(product, userContext);

    // Simulate delay for loading animation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, data: mockContent };
  } catch (error) {
    console.error("Error in unified product content generation:", error);
    return {
      success: false,
      error: "Unable to generate product content at this time.",
    };
  }
}

/**
 * Implementation of the Gemini API integration for unified content generation
 */
async function callGeminiUnifiedAPI(product, userContext) {
  const apiEndpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

  const userContextString = userContext
    ? JSON.stringify(userContext, null, 2)
    : "No user context available";
  const productTags = Array.isArray(product.tags)
    ? product.tags.join(", ")
    : product.tags || "";

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a luxury jewelry consultant and copywriter. Generate TWO pieces of content for this jewelry product:

1. PRODUCT DESCRIPTION: Write a short, crisp, and elegant product description (2-3 sentences max) that highlights the key selling points, materials, and style. Make it sound premium and desirable.

2. PERSONALIZED RECOMMENDATION: Based on the user's preferences and context, write a compelling "Why This is a Good Buy" recommendation (2-3 sentences max) that explains how this specific piece matches their style, needs, and preferences. Make it personal and convincing.

Product Details:
- Name: ${product.product_name}
- Price: $${product.price}
- Category: ${product.category}
- Tags: ${productTags}
- Description: ${product.description || "Premium jewelry piece"}

User Context & Preferences:
${userContextString}

Please respond in this exact JSON format:
{
  "description": "Your product description here",
  "recommendation": "Your personalized recommendation here"
}`,
            },
          ],
        },
      ],
    }),
  });

  const result = await response.json();
  if (!result.candidates || result.candidates.length === 0) {
    console.error("Gemini API error:", result.error || "Unknown error");
    throw new Error("Failed to get response from Gemini API");
  }

  const textResponse = result?.candidates[0]?.content?.parts[0]?.text;

  try {
    // Try to parse JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResponse = JSON.parse(jsonMatch[0]);
      return {
        description:
          parsedResponse.description || generateMockDescription(product),
        recommendation:
          parsedResponse.recommendation ||
          generateMockRecommendation(product, userContext),
      };
    }
  } catch (parseError) {
    console.warn("Failed to parse JSON response, using fallback");
  }

  // Fallback to mock data if parsing fails
  return generateMockProductContent(product, userContext);
}

/**
 * Generate mock content for both description and recommendation
 */
function generateMockProductContent(product, userContext) {
  return {
    description: generateMockDescription(product),
    recommendation: generateMockRecommendation(product, userContext),
  };
}

/**
 * Generate mock description based on product
 */
function generateMockDescription(product) {
  const productName = product.product_name || "this piece";
  const productCategory = product.category || "jewelry";
  const tags = Array.isArray(product.tags)
    ? product.tags
    : (product.tags || "").split(", ");

  // Extract style and material from tags
  const styleWords = tags.filter((tag) =>
    [
      "elegant",
      "modern",
      "classic",
      "vintage",
      "contemporary",
      "sophisticated",
      "luxury",
      "premium",
    ].includes(tag.toLowerCase())
  );

  const materialWords = tags.filter((tag) =>
    [
      "gold",
      "silver",
      "diamond",
      "pearl",
      "platinum",
      "rose gold",
      "white gold",
    ].includes(tag.toLowerCase())
  );

  const style = styleWords.length > 0 ? styleWords[0] : "elegant";
  const material =
    materialWords.length > 0 ? materialWords[0] : "premium materials";

  return `This ${style.toLowerCase()} ${productName.toLowerCase()} showcases exquisite craftsmanship and ${material.toLowerCase()}. Perfect for special occasions, it combines timeless beauty with contemporary design. A stunning piece that adds sophistication to any ensemble.`;
}

/**
 * Generate mock personalized recommendation based on product and user context
 */
function generateMockRecommendation(product, userContext) {
  const productName = product.product_name || "this piece";
  const productCategory = product.category || "jewelry";

  // Extract user preferences from context
  const userStyle =
    userContext?.style || userContext?.preferences?.style || "elegant";
  const userOccasion =
    userContext?.occasion ||
    userContext?.preferences?.occasion ||
    "special occasions";
  const userBudget =
    userContext?.budget || userContext?.preferences?.budget || "luxury";

  const recommendations = [
    `This ${productName} perfectly matches your ${userStyle} style and is ideal for ${userOccasion}. The quality and craftsmanship make it a worthwhile investment that you'll treasure for years to come.`,
    `Based on your preferences, this ${productCategory} piece aligns beautifully with your ${userStyle} aesthetic. It's versatile enough for both everyday elegance and special moments.`,
    `This ${productName} is an excellent choice for your ${userBudget} budget range. Its timeless design ensures it will remain stylish and valuable, making it a smart investment in your jewelry collection.`,
    `Perfect for your ${userStyle} taste, this piece offers exceptional value. The quality materials and expert craftsmanship mean it will last a lifetime while complementing your personal style.`,
  ];

  return recommendations[Math.floor(Math.random() * recommendations.length)];
}
