"use server";

const SPEECHIFY_API_ENDPOINT = "https://api.sws.speechify.com/v1/audio/speech";

/**
 * Generates speech audio data from text using the Speechify API
 * This is a server-side only function
 */
export async function getSpeechForText(inputText) {
  try {
    if (!inputText || typeof inputText !== "string") {
      console.error("Invalid text input for speech generation");
      return { success: false };
    }

    if (
      process.env.USE_MOCK_DATA === "true" ||
      !process.env.SPEECHIFY_API_KEY
    ) {
      return { success: false, reason: "TTS is not enabled" };
    }

    const response = await fetch(SPEECHIFY_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SPEECHIFY_API_KEY}`,
      },
      body: JSON.stringify({
        input: trimmedText,
        voice_id: "kristy",
        emotion: "energetic",
      }),
    });

    if (!response.ok) {
      console.error("Speechify API error:", response.status);
      return { success: false };
    }

    const result = await response.json();

    if (!result.audio_data) {
      console.error("No audio data returned from API");
      return { success: false };
    }

    return {
      success: true,
      audio_data: result.audio_data,
      audio_format: result.audio_format || "wav",
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    return { success: false };
  }
}
