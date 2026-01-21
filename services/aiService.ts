
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AIAnalysisResult {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
    laborPercentage: number;
    materialPercentage: number;
    tips: string[];
    marketInsight: string;
}

export const generateFinishingAnalysis = async (
    area: number,
    selectedItems: string[],
    language: 'ar' | 'en'
): Promise<AIAnalysisResult> => {
    
    const prompt = `
        Act as an expert construction cost estimator in Egypt (2025 Market Prices).
        Analyze a finishing project for a ${area} square meter unit.
        
        Selected Items/Finishes: ${selectedItems.join(', ')}.
        
        Provide:
        1. A realistic cost range (Low/High) in EGP considering current inflation.
        2. A split between Material cost vs Labor cost (as percentages).
        3. 3 specific, actionable tips to save money or improve quality based specifically on the selected items.
        4. A one-sentence market insight about current material availability or pricing trends in Egypt.
        
        Output in ${language === 'ar' ? 'Arabic' : 'English'}.
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            lowEstimate: { type: Type.NUMBER, description: "Lower bound of total cost in EGP" },
            highEstimate: { type: Type.NUMBER, description: "Upper bound of total cost in EGP" },
            currency: { type: Type.STRING, description: "Currency code (EGP)" },
            laborPercentage: { type: Type.NUMBER, description: "Estimated percentage of cost going to labor (0-100)" },
            materialPercentage: { type: Type.NUMBER, description: "Estimated percentage of cost going to materials (0-100)" },
            tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 specific tips based on selections"
            },
            marketInsight: { type: Type.STRING, description: "Brief market context" }
        },
        required: ["lowEstimate", "highEstimate", "laborPercentage", "materialPercentage", "tips", "marketInsight"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.3 // Low temperature for more factual financial estimates
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        return JSON.parse(text) as AIAnalysisResult;
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback or re-throw depending on app strategy. 
        // For this demo, we return a fallback based on simple math to prevent crash.
        return {
            lowEstimate: area * 5000,
            highEstimate: area * 7000,
            currency: "EGP",
            laborPercentage: 40,
            materialPercentage: 60,
            tips: ["Ensure contracts specify material brands.", "Buy materials in bulk.", "Supervise execution stages."],
            marketInsight: "Market prices are volatile; estimation is approximate."
        };
    }
};
