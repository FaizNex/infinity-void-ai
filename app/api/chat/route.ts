import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Utility function: Delay/Wait
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    // List of models to try if high demand occurs (Fallback Models)
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro'];
    let responseText = '';
    let success = false;
    let lastError = null;

    for (const modelName of modelsToTry) {
      const model = genAI.getGenerativeModel({ model: modelName });

      // Retry mechanism: 3 attempts per model with exponential delay
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await model.generateContent(lastMessage);
          responseText = result.response.text();
          success = true;
          break; // Success! Exit retry loop
        } catch (err: any) {
          lastError = err;
          
          // If it's 503 (High demand) or 429 (Rate limit), wait and retry
          if (err?.status === 503 || err?.message?.includes('503') || err?.status === 429) {
            console.warn(`[${modelName}] Attempt ${attempt} failed due to high demand. Retrying in ${attempt * 1000}ms...`);
            await delay(attempt * 1000); // 1s, 2s, 3s delay
          } else {
            // For other errors, skip retries for this model
            break;
          }
        }
      }

      if (success) break; // Exit outer model loop if successful
    }

    if (!success) {
      throw lastError || new Error('Service temporarily unavailable due to high demand. Please try again in a few moments.');
    }

    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Service is under high demand. Please try again later.' },
      { status: 500 }
    );
  }
}