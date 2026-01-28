"use server";

/**
 * Generates speech audio data from text using the ElevenLabs API
 * This is a server-side only function
 */
export async function getSpeechForText(inputText, languageCode) {
  // const currentLan = languageData.find((lan) => lan.value === languageCode);
  try {
    if (!inputText || !inputText.trim() || typeof inputText !== "string") {
      console.error("Invalid text input for speech generation");
      return { success: false };
    }

    if (!process.env.ELEVEN_LABS_API_KEY) {
      return { success: false, reason: "TTS is not enabled" };
    }

    const voiceId= process.env.ELEVEN_LABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": `${process.env.ELEVEN_LABS_API_KEY}`,
      },
      body: JSON.stringify({
        text: inputText,
        model_id: "eleven_multilingual_v2",
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
