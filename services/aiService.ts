
// We use type-only imports here. These are removed at runtime.
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

// Fallback logic
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
            isAr ? "احرص على شراء الخامات الأساسية دفعة واحدة." : "Buy basic materials in bulk.",
            isAr ? "اتفق على مصنعية المتر." : "Agree on labor per meter.",
            isAr ? "تأكد من اختبارات السباكة والكهرباء." : "Ensure plumbing/electrical tests."
        ],
        marketInsight: isAr 
            ? "تقدير تقريبي بناءً على متوسط السوق."
            : "Rough estimate based on market averages."
    };
};

// --- CLIENT FACING ESTIMATOR ---
export const generateFinishingAnalysis = async (
    area: number,
    selectedItems: string[],
    language: 'ar' | 'en'
): Promise<AIAnalysisResult> => {
    
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
        console.warn("AI API Key missing, using fallback.");
        return getFallbackData(area, language);
    }

    try {
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

        // Flatten items for the prompt
        const itemsList = currentConfig.stages.flatMap(stage => 
            [...stage.basicItems, ...stage.optionalItems].map(item => ({
                id: item.id,
                name: item.name.en + " (" + item.name.ar + ")", // Provide both names for context
                unit: item.unit.en
            }))
        );

        console.log("Sending items to AI:", itemsList.length);

        const prompt = `
            You are an expert Quantity Surveyor in Egypt (2025 Market).
            I will provide a list of items with IDs.
            
            YOUR TASK:
            Return a JSON array where each object has:
            - "id": The EXACT id provided.
            - "minPrice": Min TOTAL cost (Material+Labor) in EGP per unit.
            - "maxPrice": Max TOTAL cost (Material+Labor) in EGP per unit.
            - "minLabor": Min Labor cost in EGP.
            - "maxLabor": Max Labor cost in EGP.

            CRITICAL RULES:
            1. DO NOT change the "id". It must match exactly.
            2. Prices must be NUMBERS (no strings).
            3. Return RAW JSON only.

            ITEMS:
            ${JSON.stringify(itemsList)}
        `;

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
                temperature: 0.1 
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty AI response");
        
        console.log("AI Response received (Raw):", text.substring(0, 100) + "...");

        const cleanedText = cleanJson(text);
        const newPrices = JSON.parse(cleanedText) as any[];
        
        console.log("Parsed prices count:", newPrices.length);

        const priceMap = new Map();
        newPrices.forEach(p => {
            // Force conversion to number to avoid string issues
            priceMap.set(p.id, {
                minPrice: Number(p.minPrice) || 0,
                maxPrice: Number(p.maxPrice) || 0,
                minLabor: Number(p.minLabor) || 0,
                maxLabor: Number(p.maxLabor) || 0
            });
        });

        // Merge logic
        let updateCount = 0;
        const updatedStages = currentConfig.stages.map(stage => ({
            ...stage,
            basicItems: stage.basicItems.map(item => {
                const newPrice = priceMap.get(item.id);
                if (newPrice) updateCount++;
                return newPrice ? { ...item, ...newPrice } : item;
            }),
            optionalItems: stage.optionalItems.map(item => {
                const newPrice = priceMap.get(item.id);
                if (newPrice) updateCount++;
                return newPrice ? { ...item, ...newPrice } : item;
            })
        }));
        
        console.log(`Updated ${updateCount} items successfully.`);

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
