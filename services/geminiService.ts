// File: src/services/geminiService.ts

export interface AsciiArtData {
  art: string;
  text?: string;
}

/**
 * Streams a definition for a given topic from our serverless function proxy.
 * @param topic The word or phrase to define.
 */
export async function* streamDefinition(topic: string): AsyncGenerator<string> {
  try {
    const response = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(JSON.parse(errorText).error || `Server responded with ${response.status}`);
    }

    if (!response.body) {
      throw new Error('The response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value);
    }
  } catch (error) {
    console.error('Failed to stream definition:', error);
    yield `Error: ${(error as Error).message}`;
  }
}

/**
 * Fetches ASCII art from our serverless function proxy.
 * @param topic The topic for the ASCII art.
 * @returns A promise that resolves to an AsciiArtData object.
 */
export const generateAsciiArt = async (topic: string): Promise<AsciiArtData> => {
  const response = await fetch('/api/art', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
};