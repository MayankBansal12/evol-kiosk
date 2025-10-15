"use server";

const API_ENDPOINT_FOR_TRANSCRIPTION =
  "https://api.groq.com/openai/v1/audio/transcriptions";

export async function speechToText(audioBase64Url, languageCode) {
  try {
    if (!audioBase64Url) {
      return { success: false };
    }

    const formData = new FormData();
    formData.append("url", audioBase64Url);
    formData.append("model", "whisper-large-v3");
    formData.append("language", languageCode ?? "English");

    const apiResponse = await fetch(API_ENDPOINT_FOR_TRANSCRIPTION, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error("GROQ STT API error:", errorData);
      return { success: false };
    }

    const result = await apiResponse.json();

    return {
      success: true,
      text: result.text,
    };
  } catch (error) {
    console.error("Error generating stt:", error);
    return { success: false };
  }
}
