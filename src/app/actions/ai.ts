"use server";

import { analyzeIssue } from "@/lib/gemini";
import { transcribeAudio, textToSpeech } from "@/lib/sarvam";

/**
 * Server Action to analyze civic issues using Gemini library
 */
export async function analyzeIssueAction(description: string) {
    const result = await analyzeIssue(description);
    return JSON.parse(JSON.stringify(result));
}

/**
 * Server Action for Sarvam Transcription using library
 */
export async function transcribeAudioAction(base64Audio: string) {
    const result = await transcribeAudio(base64Audio);
    return JSON.parse(JSON.stringify(result));
}

/**
 * Server Action for Sarvam TTS using library
 */
export async function textToSpeechAction(text: string, speaker: string = "shubh", languageCode: string = "hi-IN") {
    const result = await textToSpeech(text, speaker, languageCode);
    return JSON.parse(JSON.stringify(result));
}
