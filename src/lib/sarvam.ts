import { SarvamAIClient } from "sarvamai";

// API Key provided by user
const SARVAM_API_KEY = "sk_i53bnid4_zS6bj83N4GwqroFHQ20tHPH7";

export const sarvamClient = new SarvamAIClient({
    apiSubscriptionKey: SARVAM_API_KEY
});

/**
 * Transcribe audio using Sarvam AI Saaras:v3
 */
export async function transcribeAudio(audioFile: File | Blob) {
    try {
        const response = await sarvamClient.speechToText.transcribe({
            file: audioFile as any,
            model: "saaras:v3",
            mode: "transcribe"
        });
        return response;
    } catch (error) {
        console.error("Sarvam STT Error:", error);
        throw error;
    }
}

/**
 * Convert text to speech using Sarvam AI Bulbul:v3
 */
export async function textToSpeech(text: string, speaker: string = "shubh") {
    try {
        const response = await sarvamClient.textToSpeech.convert({
            text,
            model: "bulbul:v3",
            speaker: speaker as any,
            target_language_code: "en-IN"
        });
        return response.audios;
    } catch (error) {
        console.error("Sarvam TTS Error:", error);
        throw error;
    }
}
