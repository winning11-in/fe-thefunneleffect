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

    try {
      let generatedContent = "";

      if (provider === "gemini") {
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Gemini API key not configured");
        }
        // Call Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Write a comprehensive and engaging blog post based on the following title and description. Create natural, flowing content that feels authentic and valuable to readers. Use descriptive headings for different sections, include relevant examples or insights where they fit naturally, and format with appropriate HTML tags like <h2> for headings, <p> for paragraphs, <strong> for emphasis, and <ul>/<li> for lists when helpful.

Title: "${title}"
Description: "${description}"
${references ? `Additional References: ${references}` : ''}

Focus on creating content that reads like it was written by a knowledgeable expert, not an AI. Avoid forced conclusions or overly structured formats.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate content with Gemini");
        }

        const data = await response.json();
        generatedContent = data.candidates[0].content.parts[0].text;
      } else if (provider === "perplexity") {
        const apiKey = (import.meta as any).env.VITE_PERPLEXITY_API_KEY;
        if (!apiKey) {
          throw new Error("Perplexity API key not configured");
        }
        // Call Perplexity API
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
                  content: `Write a comprehensive and engaging blog post based on the following title and description. Create natural, flowing content that feels authentic and valuable to readers. Use descriptive headings for different sections, include relevant examples or insights where they fit naturally, and format with appropriate HTML tags like <h2> for headings, <p> for paragraphs, <strong> for emphasis, and <ul>/<li> for lists when helpful.

Title: "${title}"
Description: "${description}"

Focus on creating content that reads like it was written by a knowledgeable expert, not an AI. Avoid forced conclusions or overly structured formats.`,
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate content with Perplexity");
        }

        const data = await response.json();
        generatedContent = data.choices[0].message.content;
      }

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
