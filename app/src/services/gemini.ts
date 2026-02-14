const GROQ_API_KEY = "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";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callAI(prompt: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI study assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("AI Error:", err);
    throw new Error("AI failed");
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

/* ================================
   CHAT
================================ */

export async function generateAIResponse(
  prompt: string,
  personality?: string
) {
  const aiName =
    localStorage.getItem("studblud_ai_name") || "StudBlud";

  const systemPrompt = `
You are an AI study assistant named ${aiName}.
Personality: ${personality || "helpful"}

User Question:
${prompt}
`;

  return callAI(systemPrompt);
}

/* ================================
   SUMMARY
================================ */

export function generateSummary(topic: string) {
  return callAI(
    `Create a student-friendly summary about ${topic} with bullet points.`
  );
}

/* ================================
   FLASHCARDS
================================ */

export async function generateFlashcards(topic: string, count = 10) {
  const text = await callAI(
    `Create ${count} flashcards about ${topic}. Format as Question: Answer`
  );

  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [front, back] = line.split(":");
      return { front, back };
    });
}

export async function answerDoubt(topic: string, question: string) {
  return callAI(
    `Topic: ${topic}\nStudent Question: ${question}`
  );
}
