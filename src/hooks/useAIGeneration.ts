import { useState } from "react";

export type AIProvider = "gemini" | "perplexity";

interface UseAIGenerationProps {
  onContentGenerated: (content: string) => void;
  onError: (error: string) => void;
}

export const useAIGeneration = ({
  onContentGenerated,
  onError,
}: UseAIGenerationProps) => {
  const [generating, setGenerating] = useState(false);

  const generateContent = async (
    provider: AIProvider,
    title: string,
    description: string,
    references?: string
  ) => {
    if (!title || !description) {
      onError("Title and description are required for AI generation");
      return;
    }

    setGenerating(true);

    // 🔥 Optimized Prompt (Used for both APIs)
    const finalPrompt = `
You are an expert content writer who specializes in creating engaging, high-quality, SEO-friendly blog articles that feel natural, human, and story-driven.

Your task:
Create a fully polished, well-structured, professional blog article in clean HTML.

---------------------------------------
🔶 STRUCTURE REQUIREMENTS
---------------------------------------
1. Begin with the title inside an <h1> tag
2. Add a compelling introduction (<p>) that hooks the reader
3. Create 4–6 major sections using <h2> tags
4. Add <h3> subsections when needed for clarity
5. Use <p> for all paragraphs
6. Use <ul><li> or <ol><li> lists for steps, best practices, key points
7. Use <strong> and <em> for highlights
8. Add real-world examples, scenarios, or case-style explanations
9. Add transitions between sections so the flow feels human
10. End with a strong conclusion that summarizes and encourages action

---------------------------------------
🔶 CONTENT GUIDELINES
---------------------------------------
- The tone must be friendly, expert, modern, and conversational
- Avoid robotic or repetitive phrasing
- Ensure the article feels engaging and reader-first
- Include insights, tips, warnings, and common mistakes
- Make the article informational, valuable, and enjoyable
- Keep paragraphs short and readable
- Maintain SEO-friendly structure (headings, semantic clarity, key phrases)

---------------------------------------
🔶 OUTPUT RULES
---------------------------------------
- Output pure HTML only
- No markdown, no code blocks, no backticks
- Do NOT say anything extra — only output the HTML article

---------------------------------------
🔶 INPUT
---------------------------------------
Title: "${title}"
Description: "${description}"
${references ? `Additional References: ${references}` : ""}
`;

    try {
      let generatedContent = "";

      // --------------------------
      // 🌟 GEMINI GENERATION
      // --------------------------
      if (provider === "gemini") {
        const apiKey = "AIzaSyDwKDMYJnEGzJuhSqmEEFYYEBwSK4zzQ-c";
        if (!apiKey) {
          throw new Error("Gemini API key not configured");
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: finalPrompt }],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate content with Gemini");
        }

        const data = await response.json();
        generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        generatedContent = generatedContent.replace(/^```html\s*/, '').replace(/\s*```$/, '');

      }

      // --------------------------
      // 🌟 PERPLEXITY GENERATION
      // --------------------------
      else if (provider === "perplexity") {
        const apiKey = (import.meta as any).env.VITE_PERPLEXITY_API_KEY;
        if (!apiKey) {
          throw new Error("Perplexity API key not configured");
        }

        const response = await fetch(
          "https://api.perplexity.ai/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [
                {
                  role: "user",
                  content: finalPrompt,
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate content with Perplexity");
        }

        const data = await response.json();
        generatedContent = data.choices?.[0]?.message?.content || "";
        generatedContent = generatedContent.replace(/^```html\s*/, '').replace(/\s*```$/, '');

      }

      // Returned HTML
      onContentGenerated(generatedContent);
    } catch (err) {
      console.error("Error generating content:", err);
      onError(
        err instanceof Error
          ? err.message
          : "Failed to generate content with AI"
      );
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateContent,
    generating,
  };
};
