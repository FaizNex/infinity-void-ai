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
    
    // Using gemini-3.8-flash as officially recommended by Google API
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

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