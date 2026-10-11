import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY Missing in Vercel Environment Variables' },
        { status: 500 }
      );
    }

    // Latest message extract karein
    const lastMessage = messages[messages.length - 1];
    const promptText = lastMessage?.content || "Hello";

    // Direct Google Gemini API endpoint call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json(
        { error: data.error?.message || 'Gemini API Error' },
        { status: response.status }
      );
    }

    // Extract generated text
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Koi response nahi mila.";

    return NextResponse.json({ content: reply });
  } catch (error: any) {
    console.error("Server Route Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 } 
    );
  }
}