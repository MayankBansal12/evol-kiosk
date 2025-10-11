"use server";

import { generateMockResponse, getMockProducts } from "@/lib/mockForm";
import { filterProductsByAIResponse } from "@/lib/productHelpers";
import { JEWELLERY_STYLIST_PROMPT } from "./prompts";

/**
 * Server action to interact with survey form
 */
export async function getAIResponse(messages, userName) {
  try {
    const USE_MOCK_DATA =
      process.env.USE_MOCK_DATA === "true" || !process.env.GEMINI_API_KEY;

    if (!USE_MOCK_DATA) {
      console.log("Calling Gemini API with conversation context");

      const apiResponse = await callGeminiAPI(messages, userName);
      return { success: true, data: apiResponse };
    }

    console.log("Using mock data for AI responses");
    const response = generateMockResponse(messages, userName);

    // Simulate delay for loading animation
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true, data: response };
  } catch (error) {
    console.error("Error in AI processing:", error);
    return {
      success: false,
      error:
        "We encountered an issue with our Evol-e assistant. Please try again.",
    };
  }
}

/**
 * Implementation of the Gemini API integration using the 2.5 Flash Lite model
 */
async function callGeminiAPI(messages, userName) {
  const apiEndpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

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
          parts: [{ text: JEWELLERY_STYLIST_PROMPT }],
        },
        {
          role: "user",
          parts: [
            {
              text:
                `I am ${userName}. \n\n Conversation context till now:\n` +
                JSON.stringify(messages),
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
  return parseGeminiResponse(textResponse);
}

/**
 * Parse the Gemini API response to extract structured data
 */
function parseGeminiResponse(textResponse) {
  try {
    // Look for JSON in the response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.log("json didn't match from AI response: ", textResponse);
      return {
        content:
          textResponse.split("\n")[0] ||
          "What would you like to know about jewellery?",
        type: "question",
        options: ["Yes", "No", "Tell me more", "Show me options"],
      };
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);

    if (jsonResponse.type === "products") {
      // Filter and score products based on AI response
      try {
        const category = jsonResponse.category || null;
        const filteredProducts = filterProductsByAIResponse(
          category,
          jsonResponse.tags || [],
          jsonResponse.metadata || {}
        );

        return {
          content:
            jsonResponse.message || "Here are some pieces I think you'll love.",
          type: "products",
          products: filteredProducts,
          category: category,
          tags: jsonResponse.tags || [],
          metadata: jsonResponse.metadata || {},
        };
      } catch (error) {
        console.error("Error filtering products:", error);
        // Fallback to mock products if filtering fails
        return {
          content: "Here are some beautiful pieces I think you'll love.",
          type: "products",
          products: getMockProducts(),
          category: jsonResponse.category || null,
          tags: jsonResponse.tags || [],
          metadata: jsonResponse.metadata || {},
        };
      }
    }

    // default to question
    return {
      content:
        jsonResponse.message || "What would you like to know about jewellery?",
      type: "question",
      options: jsonResponse.options || ["Continue", "Start over"],
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);

    // Fallback to a simple question
    return {
      content:
        "I'm not sure I understood. Would you like to see some jewellery options?",
      type: "question",
      options: ["Yes, show me options", "No, ask me something else"],
    };
  }
}
