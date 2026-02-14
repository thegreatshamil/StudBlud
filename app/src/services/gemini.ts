const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

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

  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "No response generated."
  );
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
Personality: ${personality || "helpful"}.
Be clear, concise, and student-friendly.

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
    `Create a clear student-friendly summary about ${topic} with bullet points.`
  );
}

/* ================================
   FLASHCARDS
================================ */

export async function generateFlashcards(topic: string, count = 10) {
  const text = await callAI(
    `Create ${count} flashcards about ${topic}.
Format strictly as:
Question: ...
Answer: ...`
  );

  return text
    .split("\n")
    .filter(line => line.includes(":"))
    .map((line) => {
      const [front, ...rest] = line.split(":");
      return {
        front: front.trim(),
        back: rest.join(":").trim(),
      };
    });
}

export async function answerDoubt(topic: string, question: string) {
  return callAI(
    `Topic: ${topic}
Student Question: ${question}
Explain clearly with simple language.`
  );
}
