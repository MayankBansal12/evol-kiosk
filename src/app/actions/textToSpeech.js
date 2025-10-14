"use server";

import languageData from "@/data/languages.json";

/**
 * Generates speech audio data from text using the ElevenLabs API
 * This is a server-side only function
 */
export async function getSpeechForText(inputText, languageCode = "en") {
  const currentLan = languageData.find((lan) => lan.code === languageCode);
  try {
    if (!inputText || !inputText.trim() || typeof inputText !== "string") {
      console.error("Invalid text input for speech generation");
      return { success: false };
    }

    if (
      process.env.USE_MOCK_DATA === "true" ||
      !process.env.ELEVEN_LABS_API_KEY
    ) {
      return { success: false, reason: "TTS is not enabled" };
    }

    console.log(
      "Generating speech for language:",
      languageCode,
      "using voice_id:",
      currentLan.voice_id
    );

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/2zRM7PkgwBPiau2jvVXc`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": `${process.env.ELEVEN_LABS_API_KEY}`,
      },
      body: JSON.stringify({
        text: inputText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json()
      console.error("ElevenLabs API error:", response.status, errorData);
      return { success: false, reason: `API error: ${response.status}` };
    }

    const audioBuffer = await response.arrayBuffer();

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.error("No audio data returned from ElevenLabs API");
      return { success: false };
    }

    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, chunk);
    }
    
    const base64String = btoa(binaryString);

    return {
      success: true,
      audio_data: base64String,
      audio_format: "mp3",
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    return { success: false, reason: error.message };
  }
}
