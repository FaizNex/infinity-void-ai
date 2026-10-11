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
    
    // Model ke sath system instruction add kar di hai taaki yeh apna naam Infinity Void AI bataye
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: "You are Infinity Void AI, a next-gen intelligence workspace. Always identify yourself strictly as Infinity Void AI. Never call yourself Gemini and never say you were built by Google."
    });

    const result = await model.generateContent(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({ content: responseText });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}