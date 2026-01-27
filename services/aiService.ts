
// We use type-only imports here. These are removed at runtime, so they won't cause 
// "Failed to fetch" errors if the module is missing or fails to load initially.
import type { GenerateContentResponse, Schema } from "@google/genai";
import type { AIEstimatorConfig, AIEstimatorItem } from "../types";

export interface AIAnalysisResult {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
    laborPercentage: number;
    materialPercentage: number;
    tips: string[];
    marketInsight: string;
}

// Helper to clean AI response from Markdown code blocks
const cleanJson = (text: string): string => {
    let clean = text.trim();
    // Remove ```json ... ``` wrapper if present
    if (clean.startsWith('```json')) {
        clean = clean.replace('```json', '').replace(/```$/, '');
    } else if (clean.startsWith('```')) {
        clean = clean.replace('```', '').replace(/```$/, '');
    }
    return clean.trim();
};

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

// --- CLIENT FACING ESTIMATOR ---
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
        
        return JSON.parse(cleanJson(text)) as AIAnalysisResult;

    } catch (error) {
        console.error("AI Generation Error (falling back):", error);
        return getFallbackData(area, language);
    }
};

// --- ADMIN FACING PRICE UPDATE ---
export const updateEstimatorPricesWithAI = async (currentConfig: AIEstimatorConfig): Promise<AIEstimatorConfig> => {
    
    // 1. Resolve API Key
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

    if (!apiKey) {
        throw new Error("AI API Key missing");
    }

    try {
        // @ts-ignore
        const { GoogleGenAI, Type } = await import("@google/genai");

        // Construct a prompt that focuses purely on extracting prices for IDs
        const itemsList = currentConfig.stages.flatMap(stage => 
            [...stage.basicItems, ...stage.optionalItems].map(item => ({
                id: item.id,
                name: item.name.ar + " / " + item.name.en,
                unit: item.unit.ar
            }))
        );

        const prompt = `
            You are an expert Quantity Surveyor in Egypt (2025 Market).
            I will provide a list of finishing items with IDs. 
            
            YOUR TASK:
            Return a JSON array of objects. Each object must have:
            - "id" (String): The exact ID I provided.
            - "minPrice" (Number): Minimum TOTAL cost (Material + Labor) per unit in EGP.
            - "maxPrice" (Number): Maximum TOTAL cost (Material + Labor) per unit in EGP.
            - "minLabor" (Number): Minimum Labor-only cost per unit in EGP.
            - "maxLabor" (Number): Maximum Labor-only cost per unit in EGP.

            RULES:
            1. Prices must be realistic for high-quality finishing in New Heliopolis/Cairo 2025.
            2. Labor cost is usually 25-40% of the total cost depending on the item.
            3. Do NOT return 0. Estimate based on market averages if unsure.
            4. STRICTLY match the IDs provided.
            5. Return raw JSON only, no markdown formatting.

            ITEMS TO PRICE:
            ${JSON.stringify(itemsList, null, 2)}
        `;

        // Define a flat schema for the response to ensure simple parsing
        const responseSchema: Schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    minPrice: { type: Type.NUMBER },
                    maxPrice: { type: Type.NUMBER },
                    minLabor: { type: Type.NUMBER },
                    maxLabor: { type: Type.NUMBER }
                },
                required: ["id", "minPrice", "maxPrice", "minLabor", "maxLabor"]
            }
        };

        const ai = new GoogleGenAI({ apiKey });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1 // Very low temp for precision
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty AI response");
        
        // Clean JSON before parsing to handle Markdown wrappers
        const cleanedText = cleanJson(text);
        const newPrices = JSON.parse(cleanedText) as { id: string, minPrice: number, maxPrice: number, minLabor: number, maxLabor: number }[];
        
        // Convert array to map for O(1) lookup
        const priceMap = new Map(newPrices.map(p => [p.id, p]));

        // Deep merge logic: Keep original structure, only update prices if found
        const updatedStages = currentConfig.stages.map(stage => ({
            ...stage,
            basicItems: stage.basicItems.map(item => {
                const newPrice = priceMap.get(item.id);
                return newPrice ? { ...item, ...newPrice } : item;
            }),
            optionalItems: stage.optionalItems.map(item => {
                const newPrice = priceMap.get(item.id);
                return newPrice ? { ...item, ...newPrice } : item;
            })
        }));
        
        // Return updated config
        return {
            ...currentConfig,
            stages: updatedStages,
            lastUpdated: new Date().toISOString()
        };

    } catch (error) {
        console.error("AI Price Update Error:", error);
        throw error;
    }
};
