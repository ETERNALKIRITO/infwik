import { GoogleGenerativeAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: "Missing or invalid 'topic' in request body" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Define the word or phrase "${topic}" in a single, concise paragraph. Focus on the core meaning and significance.`;

    const result = await model.generateContentStream(prompt);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    for await (const chunk of result.stream) {
      res.write(chunk.text());
    }

    res.end();

  } catch (error: any) {
    console.error('Error in stream handler:', error);
    if (!res.headersSent) {
        res.status(500).json({ error: 'An error occurred while streaming the definition.' });
    } else {
        res.end();
    }
  }
}