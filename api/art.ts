import { GoogleGenerativeAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: "Missing or invalid 'topic'" });
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

    res.status(200).json({
        art: art.trim(),
        text: text ? text.trim() : ''
    });

  } catch (error: any) {
    console.error('Error generating ASCII art:', error);
    res.status(500).json({ error: 'An error occurred while generating ASCII art.' });
  }
}