import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: lastMessage,
    });

    return NextResponse.json({ content: response.text });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}