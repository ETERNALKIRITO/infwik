import { GoogleGenerativeAI } from '@google/genai';
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Define the word or phrase "${topic}" in a single, concise paragraph. Focus on the core meaning and significance.`;

    // Note: Netlify Functions (v2) have a simpler return format for streams.
    // For now, we will generate the full content and return it.
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

export { handler };