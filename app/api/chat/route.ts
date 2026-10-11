import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in Vercel settings.' },
        { status: 500 }
      );
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || 'Hello';

    const genAI = new GoogleGenerativeAI(apiKey);

    // Primary and fallback models supported by Google Gemini
    const supportedModels = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];
    let responseText = '';
    let lastError = null;

    for (const modelName of supportedModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction:
            "You are Infinity Void AI, a next-gen intelligence workspace. Always identify yourself strictly as Infinity Void AI. Never call yourself Gemini and never say you were built by Google.",
        });

        const result = await model.generateContent(lastMessage);
        responseText = result.response.text();
        
        // If successful, exit loop
        if (responseText) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying next fallback...`, err?.message);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('Unable to connect to AI models.');
    }

    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}