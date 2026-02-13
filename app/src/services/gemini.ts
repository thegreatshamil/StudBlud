import type { GeminiResponse } from '@/types';

const API_KEY = 'AIzaSyBzurxPl1gPAMGD8pPKTm3FL-B_xfkmY2E';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateAIResponse(prompt: string, personality?: string): Promise<string> {
  try {
    let systemPrompt = '';
    
    switch (personality) {
      case 'friendly':
        systemPrompt = 'You are a friendly and encouraging study assistant. Be warm, supportive, and use encouraging language.';
        break;
      case 'strict':
        systemPrompt = 'You are a strict and direct study assistant. Be concise, factual, and challenge the student to think critically.';
        break;
      case 'funny':
        systemPrompt = 'You are a witty and light-hearted study assistant. Use humor and make learning fun while being informative.';
        break;
      case 'socratic':
        systemPrompt = 'You are a Socratic study assistant. Ask guiding questions to help the student discover answers themselves.';
        break;
      default:
        systemPrompt = 'You are a helpful study assistant. Provide clear, accurate, and educational responses.';
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return 'I apologize, but I could not generate a response at this time.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Sorry, I encountered an error. Please try again later.';
  }
}

export async function generateSummary(topic: string): Promise<{ summary: string; keyPoints: string[] }> {
  try {
    const prompt = `Generate a comprehensive summary about "${topic}" for a student. Include:
1. A clear, concise summary (2-3 paragraphs)
2. 5-7 key points to remember

Format your response as:
SUMMARY:
[Your summary here]

KEY POINTS:
1. [Point 1]
2. [Point 2]
...`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the response
    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/i);
    const keyPointsMatch = text.match(/KEY POINTS:\s*([\s\S]*?)$/i);
    
    const summary = summaryMatch ? summaryMatch[1].trim() : text;
    const keyPointsText = keyPointsMatch ? keyPointsMatch[1].trim() : '';
    
    const keyPoints = keyPointsText
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    return { summary, keyPoints };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      summary: 'Unable to generate summary at this time.',
      keyPoints: []
    };
  }
}

export async function generateFlashcards(topic: string, count: number = 10): Promise<{ front: string; back: string }[]> {
  try {
    const prompt = `Generate ${count} flashcards about "${topic}" for studying. Each flashcard should have a question/concept on the front and the answer/explanation on the back.

Format your response as:
FRONT: [Question or concept]
BACK: [Answer or explanation]
---
FRONT: [Question or concept]
BACK: [Answer or explanation]
---
(continue for ${count} flashcards)`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse flashcards
    const flashcards: { front: string; back: string }[] = [];
    const cardBlocks = text.split('---');
    
    for (const block of cardBlocks) {
      const frontMatch = block.match(/FRONT:\s*([\s\S]*?)(?=BACK:|$)/i);
      const backMatch = block.match(/BACK:\s*([\s\S]*?)$/i);
      
      if (frontMatch && backMatch) {
        flashcards.push({
          front: frontMatch[1].trim(),
          back: backMatch[1].trim()
        });
      }
    }

    return flashcards;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return [];
  }
}

export async function answerDoubt(topic: string, question: string): Promise<string> {
  try {
    const prompt = `The student is studying "${topic}" and asks: "${question}"

Provide a clear, educational answer that helps them understand the concept. Be thorough but concise.`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to answer doubt');
    }

    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to answer at this time.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}
