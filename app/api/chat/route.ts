import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");

async function generateAIResponse() {
  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-pro" }, 
      { apiVersion: "v1" }
    );

    const prompt = "Hii";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(text);
  } catch (error) {
    console.error(error);
  }
}

generateAIResponse();