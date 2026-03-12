import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCtQ706eiRlM94FIKN6Oqiq1raZNqizbb0";
const genAI = new GoogleGenerativeAI(API_KEY);

// Primary model: gemini-3.1-flash-lite-preview
export const flashLiteModel = genAI.getGenerativeModel({ 
    model: "gemini-3.1-flash-lite-preview",
});

// Model for v2: gemini-2.5-flash-lite
export const modelV2 = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
});

// Audio model: gemini-live-2.5-flash-native-audio
export const audioModel = genAI.getGenerativeModel({ 
    model: "gemini-live-2.5-flash-native-audio",
});

/**
 * Analyze civic issues and provide categorisation/priority
 */
export async function analyzeIssue(description: string) {
    const prompt = `
    Analyze the following civic issue reported by a citizen in Delhi:
    "${description}"
    
    Provide a JSON response with:
    - category: string (one of: Water Leakage, Garbage Collection, Street Light, Road Repair, Drainage, Other)
    - priority: string (one of: Critical, High, Medium, Low)
    - department: string (appropriate MCD department)
    - suggestedAction: string (short recommendation for back-office)
    `;

    try {
        const result = await flashLiteModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean markdown if present
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            category: "Other",
            priority: "Medium",
            department: "General Administration",
            suggestedAction: "Conduct manual inspection."
        };
    }
}
