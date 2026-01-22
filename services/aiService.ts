
// We use type-only imports here. These are removed at runtime, so they won't cause 
// "Failed to fetch" errors if the module is missing or fails to load initially.
import type { GenerateContentResponse, Schema } from "@google/genai";

export interface AIAnalysisResult {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
    laborPercentage: number;
    materialPercentage: number;
    tips: string[];
    marketInsight: string;
}

// Fallback logic in case AI fails or is offline
const getFallbackData = (area: number, language: 'ar' | 'en'): AIAnalysisResult => {
    const isAr = language === 'ar';
    const baseRateLow = 5000;
    const baseRateHigh = 7000;
    
    return {
        lowEstimate: area * baseRateLow,
        highEstimate: area * baseRateHigh,
        currency: "EGP",
        laborPercentage: 40,
        materialPercentage: 60,
        tips: [
            isAr ? "احرص على شراء الخامات الأساسية (أسمنت، رمل) دفعة واحدة لتوفير النقل." : "Buy basic materials (cement, sand) in bulk to save on transport.",
            isAr ? "اتفق على مصنعية المتر بدلاً من المقاولة المقطوعية لضمان العدالة." : "Agree on labor per meter rather than a lump sum for fairness.",
            isAr ? "تأكد من استلام بنود التأسيس (سباكة وكهرباء) باختبارات ضغط معتمدة." : "Ensure foundation items (plumbing/electrical) pass pressure tests."
        ],
        marketInsight: isAr 
            ? "هذا تقدير تقريبي مبني على متوسط أسعار السوق الحالية؛ قد تختلف الأسعار الفعلية بناءً على جودة التشطيب المختارة."
            : "This is a rough estimate based on current market averages; actual prices may vary based on finishing quality."
    };
};

export const generateFinishingAnalysis = async (
    area: number,
    selectedItems: string[],
    language: 'ar' | 'en'
): Promise<AIAnalysisResult> => {
    
    // 1. Resolve API Key safely
    let apiKey = '';
    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env?.API_KEY) {
            // @ts-ignore
            apiKey = process.env.API_KEY;
        } else if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
            apiKey = (import.meta as any).env.VITE_API_KEY;
        }
    } catch (e) {
        console.warn("Environment variable access failed");
    }

    // 2. If no key, return fallback immediately
    if (!apiKey) {
        console.warn("AI API Key missing, using fallback.");
        return getFallbackData(area, language);
    }

    try {
        // 3. Dynamic Import of SDK
        // This prevents the "Failed to fetch dynamically imported module" crash on page load
        // @ts-ignore
        const { GoogleGenAI, Type } = await import("@google/genai");

        const prompt = `
            Act as an expert construction cost estimator in Egypt (2025 Market).
            Analyze a finishing project for a ${area} square meter unit.
            Selected Items: ${selectedItems.join(', ')}.
            
            Return JSON with:
            - lowEstimate (number, EGP)
            - highEstimate (number, EGP)
            - laborPercentage (number 0-100)
            - materialPercentage (number 0-100)
            - tips (array of 3 strings in ${language === 'ar' ? 'Arabic' : 'English'})
            - marketInsight (string in ${language === 'ar' ? 'Arabic' : 'English'})
        `;

        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                lowEstimate: { type: Type.NUMBER },
                highEstimate: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                laborPercentage: { type: Type.NUMBER },
                materialPercentage: { type: Type.NUMBER },
                tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                marketInsight: { type: Type.STRING }
            },
            required: ["lowEstimate", "highEstimate", "tips", "marketInsight"]
        };

        const ai = new GoogleGenAI({ apiKey });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.3
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty AI response");
        
        return JSON.parse(text) as AIAnalysisResult;

    } catch (error) {
        console.error("AI Generation Error (falling back):", error);
        return getFallbackData(area, language);
    }
};
