import * as genAI from '@google/genai';
import type { Handler, HandlerEvent } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { topic } = JSON.parse(event.body || '{}');
    if (!topic || typeof topic !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid 'topic' in request body" })
      };
    }

    // THE FIX IS HERE: adding ".default"
    const ai = new genAI.default(process.env.GEMINI_API_KEY!);
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Define the word or phrase "${topic}" in a single, concise paragraph. Focus on the core meaning and significance.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: text,
    };

  } catch (error: any) {
    console.error('Error in stream handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while streaming the definition.' })
    };
  }
};