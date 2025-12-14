import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

export const generateContentPlan = async (urlsInput: string, numTopics: number = 5): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean and format URLs for the prompt
  const urls = urlsInput.split('\n').map(u => u.trim()).filter(u => u.length > 0).join('\n');

  // Prompt designed to utilize Search Grounding and simulate NLP techniques
  const prompt = `
    Analyze the website(s) and brand presence at the following specific URL(s):
    ${urls}
    
    Perform a comprehensive content strategy analysis with the following steps:
    1.  **SERP & Niche Analysis**: Use Google Search to understand the brand's niche and current search engine results pages (SERP) landscape. 
        *   **Multi-URL Instruction**: If multiple URLs are provided (e.g., different business divisions), analyze EACH division to identify cross-functional opportunities and a holistic brand strategy.
    2.  **Semantic Analysis (BERT-style)**: Identify core topics and intents behind user searches related to these specific business areas. Move beyond exact match keywords to understand semantic search intent.
    3.  **Keyword Extraction & Scoring (Simulated TF-IDF)**: Identify high-value **NON-BRANDED** keywords. 
        *   **CRITICAL**: Strictly EXCLUDE any keywords that include the brand name, company name, or direct variations of it. 
        *   Focus entirely on generic, high-intent terms that potential customers use to find these products/services without knowing the brand yet.
        *   Assign a "Relevance Score" effectively simulating TF-IDF (Term Frequency-Inverse Document Frequency) - prioritize terms that are highly specific and important to this niche (high term frequency) but not overly generic (inverse document frequency).
    4.  **Content Planning**: Based on the gaps and opportunities found across ALL provided URLs, generate exactly ${numTopics} specific content ideas.
    
    Output strictly in valid JSON format without any markdown formatting. The JSON must follow this structure:
    {
      "domainAnalysis": {
        "niche": "String description of the niche (covering all divisions if multiple)",
        "targetAudience": "Description of target audience",
        "competitorInsights": "Summary of what competitors are doing well or missing based on SERP"
      },
      "keywords": [
        {
          "keyword": "The keyword phrase (NON-BRANDED ONLY)",
          "volume": 85, // Estimated relative search volume (0-100)
          "difficulty": 60, // Estimated SEO difficulty (0-100)
          "intent": "Informational", // One of: Informational, Transactional, Navigational, Commercial
          "relevanceScore": 0.95 // 0.0 to 1.0 (Simulated TF-IDF score)
        }
      ],
      "topics": [
        {
          "title": "Catchy SEO Title",
          "description": "Brief content brief",
          "primaryKeyword": "Main keyword",
          "secondaryKeywords": ["kw1", "kw2"],
          "projectedTraffic": "High/Medium/Low",
          "contentType": "Blog Post" // e.g. Blog Post, Landing Page
        }
      ],
      "strategicSummary": "A brief executive summary of the strategy."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // ENABLE SEARCH GROUNDING
        // Note: responseMimeType and responseSchema are NOT supported when using tools: [{ googleSearch: {} }]
      },
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    // Sanitize the output (remove markdown code blocks if present)
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};