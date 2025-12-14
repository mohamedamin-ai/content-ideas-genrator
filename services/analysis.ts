import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

export const generateContentPlan = async (
  urlsInput: string,
  pageContentInput: string,
  numTopics: number = 5,
  customIgnoreList: string[] = [],
  diversityLevel: 'low' | 'medium' | 'high' = 'medium'
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not configured. Please ensure process.env.API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const diversityInstructions = {
    low: "Focus strictly on the core business offerings found on the page. Topics should be highly cohesive, centered around the primary service/product lines. Allow overlapping themes if they are critical.",
    medium: "Balance core business topics with adjacent industry interests. Ensure a mix of direct commercial topics and broader educational content.",
    high: "Maximize breadth. Select distinct topics that cover completely different angles of the domain (e.g., one on sustainability, one on tech, one on careers, one on consumer tips). Avoid repeating similar keywords across topics."
  };

  const contentContextSection = pageContentInput.trim() 
    ? `
    ADDITIONAL CONTEXT / RAW PAGE CONTENT:
    Use the following content to deeply understand the specific brand voice, unique selling propositions (USPs), and detailed subject matter. 
    Cross-reference this content with the URL analysis and SERP results. 
    Ensure generated topics are highly relevant to *this specific material* while filling gaps found in the search results.
    
    [START OF PROVIDED CONTENT]
    ${pageContentInput.substring(0, 15000)} 
    [END OF PROVIDED CONTENT]
    ` 
    : '';

  const prompt = `
    Analyze the following URL(s):
    ${urlsInput}

    ${contentContextSection}

    OBJECTIVE:
    Generate a comprehensive content strategy plan with exactly ${numTopics} topics.
    
    CONFIGURATION:
    1. **Diversity Level**: ${diversityLevel.toUpperCase()}
       - Instruction: ${diversityInstructions[diversityLevel]}
    2. **Ignore List**: ${customIgnoreList.length > 0 ? customIgnoreList.join(', ') : 'None'}
       - Instruction: Do not use these words in the 'primaryKeyword' or 'title' fields.
    3. **Content Type**: STRICTLY generate topics formatted as "Blog Post". Do not generate Case Studies or Landing Pages.

    EXECUTION STEPS:
    1. **SERP & Grounding**: Use Google Search to analyze the live website content AND the search results for the brand's niche. 
       - Look for what competitors are writing about.
       - **Competitor Analysis**: Specifically identify:
         - Common Call-to-Actions (CTAs) used by top ranking pages.
         - Unique Selling Propositions (USPs) competitors highlight in meta descriptions.
         - Content Gaps: What are competitors missing that this brand can cover?
    2. **Keyword Extraction**: Identify high-value keywords. 
       - Exclude navigational brand queries (e.g., "Al Futtaim login").
       - Focus on non-branded, high-intent terms (e.g., "Luxury SUV maintenance Dubai" or "Retail loyalty programs").
    3. **Topic Generation**: Create topics based on the diversity instruction. Ensure every topic is suitable for a blog post.

    OUTPUT FORMAT:
    Return strictly valid JSON. Do not include any explanation or conversational text outside the JSON.
    Structure:
    {
      "domainAnalysis": {
        "niche": "Detailed niche description",
        "targetAudience": "Who is this for?",
        "competitorInsights": {
          "overview": "General landscape summary (2-3 sentences)",
          "commonCTAs": ["cta example 1", "cta example 2"],
          "uniqueSellingPoints": ["usp example 1", "usp example 2"],
          "contentGaps": ["gap example 1", "gap example 2"]
        }
      },
      "keywords": [
        {
          "keyword": "string",
          "volume": number (0-100),
          "difficulty": number (0-100),
          "intent": "Informational" | "Transactional" | "Commercial",
          "relevanceScore": number (0.0-1.0)
        }
      ],
      "topics": [
        {
          "title": "SEO Optimized Title",
          "description": "Actionable content brief.",
          "primaryKeyword": "Main focus keyword",
          "secondaryKeywords": ["kw1", "kw2"],
          "projectedTraffic": "High" | "Medium" | "Low",
          "contentType": "Blog Post"
        }
      ],
      "strategicSummary": "Executive summary of the opportunity."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is NOT supported with googleSearch
      },
    });

    let text = response.text;
    if (!text) throw new Error("Empty response from analysis engine.");

    // Clean up Markdown code blocks if present (common when MIME type isn't set)
    text = text.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parse JSON safely
    try {
      const result = JSON.parse(text) as AnalysisResult;
      // Sanity check to ensure array length matches request
      if (result.topics.length > numTopics) {
        result.topics = result.topics.slice(0, numTopics);
      }
      return result;
    } catch (e) {
      console.error("JSON Parse Error", text);
      throw new Error("Failed to parse analysis results. The model output was not valid JSON.");
    }

  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(error.message || "Failed to generate content plan.");
  }
};
