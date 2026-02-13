// Utility functions only - no fake data

// Helper to generate IDs
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to format dates
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

// Study quotes for welcome message
export const studyQuotes = [
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Education is the passport to the future.",
  "The more that you read, the more things you will know.",
  "Learning is not attained by chance, it must be sought for with ardor.",
  "The mind is not a vessel to be filled but a fire to be kindled.",
  "Knowledge is power. Information is liberating.",
  "The only person who is educated is the one who has learned how to learn.",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
];

export function getRandomQuote(): string {
  return studyQuotes[Math.floor(Math.random() * studyQuotes.length)];
}
