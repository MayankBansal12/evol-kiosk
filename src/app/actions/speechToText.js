"use server"

const API_ENDPOINT_FOR_TRANSCRIPTION = "https://api.groq.com/openai/v1/audio/transcriptions"

export async function speechToText(audioBase64Url) {
    try {
        if (!audioBase64Url) {
            return { success: false };
        }

        // Convert base64 data URL to blob
        const response = await fetch(audioBase64Url);
        const audioBlob = await response.blob();

        // Create form data for multipart upload
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3-turbo');

        const apiResponse = await fetch(API_ENDPOINT_FOR_TRANSCRIPTION, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: formData
        });

        if (!apiResponse.ok) {
            console.error("GROQ STT API error:", apiResponse.status);
            return { success: false };
        }

        const result = await apiResponse.json();
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
