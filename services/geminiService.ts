
import { GoogleGenAI } from "@google/genai";

export async function checkApiKey() {
  if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines
      return true;
    }
    return true;
  }
  return true;
}

export async function generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
  await checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}

export async function generateVideo(prompt: string, imageBase64?: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  await checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  };

  if (imageBase64) {
    payload.image = {
      imageBytes: imageBase64.split(',')[1],
      mimeType: 'image/png'
    };
  }

  let operation = await ai.models.generateVideos(payload);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
