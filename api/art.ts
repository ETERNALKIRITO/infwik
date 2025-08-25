import { GoogleGenerativeAI } from '@google/genai';
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Notice the new handler signature
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // The body comes from event.body now
    const { topic } = JSON.parse(event.body || '{}');
    if (!topic || typeof topic !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid 'topic'" })
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an ASCII art generator.
      Your task is to create a piece of ASCII art representing the concept of "${topic}".
      Below the ASCII art, provide a short, one-sentence, poetic or metaphorical description of the art.
      RULES:
      1. The ASCII art must be between 5 and 10 lines tall.
      2. The description must be a single sentence.
      3. Format your response using a special separator. The ASCII art should come first, then the string "---SEPARATOR---", then the one-sentence description.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const [art, text] = responseText.split('---SEPARATOR---');

    if (!art) {
        throw new Error('Could not generate ASCII art from model response.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        art: art.trim(), 
        text: text ? text.trim() : '' 
      })
    };

  } catch (error: any) {
    console.error('Error generating ASCII art:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while generating ASCII art.' })
    };
  }
};

export { handler };