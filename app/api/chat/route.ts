import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

async function sendMessageWithRetry(chat: any, requestPayload: any, retries = 3, delay = 2000): Promise<any> {
  try {
    const result = await chat.sendMessage(requestPayload);
    return result;
  } catch (error: any) {
    if (retries > 0 && (error.status === 503 || error.message?.includes('503') || error.message?.includes('high demand'))) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return sendMessageWithRetry(chat, requestPayload, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, imageBase64, documentBase64, documentName } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ reply: 'Gemini API Key missing hai!' }, { status: 500 });
    }

    const now = new Date();
    const currentDateTimeString = now.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      systemInstruction: `You are Infinity Void AI, an advanced AI assistant.
- Identify yourself as "Infinity Void AI".
- CRITICAL LANGUAGE RULE: Always reply in Roman script / Hinglish (using English alphabets) when the user talks in Hinglish or Hindi. Do not use Devanagari Hindi script.
- Current live date, day, and time in India is: ${currentDateTimeString}.`
    });

    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    }));

    const chat = model.startChat({ history: chatHistory });
    let currentMessageContent = messages[messages.length - 1]?.content || '';

    if (documentBase64) {
      try {
        const base64Data = documentBase64.split(',')[1];
        const decodedText = Buffer.from(base64Data, 'base64').toString('utf-8');
        currentMessageContent += `\n\n[Attached Document Content (${documentName})]:\n${decodedText}`;
      } catch (err) {
        console.error('Doc error:', err);
      }
    }

    let requestPayload: any[] = [currentMessageContent];

    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1];
      const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
      requestPayload = [
        currentMessageContent || "Analyze this image.",
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ];
    }

    const result = await sendMessageWithRetry(chat, requestPayload);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Backend Error:', error);
    return NextResponse.json({ reply: `Server Error: Server busy hai, kripya thodi der baad try karein.` }, { status: 500 });
  }
}