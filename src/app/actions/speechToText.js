"use server"

const API_ENDPOINT_FOR_TRANSCRIPTION = "https://api.groq.com/openai/v1/audio/transcriptions"

export async function speechToText(audioBase64Url) {
    try {
        if (!audioBase64Url) {
            return { success: false };
        }
        const response = await fetch(API_ENDPOINT_FOR_TRANSCRIPTION, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                url: audioBase64Url,
                model: "whisper-large-v3-turbo",
            })
        })
        if (!response.ok) {
            console.error("GROQ STT API error:", response.status);
            return { success: false };
        }

        const result = await response.json();
        console.log("transcribed text: ", result.text)

        return {
            success: true,
            text: result.text,
        };
    } catch (error) {
        console.error("Error generating stt:", error);
        return { success: false };
    }
}
