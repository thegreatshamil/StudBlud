// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  school: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  isPremium: boolean;
  workspaceLimit: number;
}

export interface Peer {
  id: string;
  userId: string;
  name: string;
  school: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  requestStatus?: 'pending' | 'accepted' | 'rejected';
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  subject: string;
  description?: string;
  color: WorkspaceColor;
  thumbnail?: string;
  ownerId: string;
  members: WorkspaceMember[];
  aiConfig: AIConfig;
  createdAt: Date;
  lastActive: Date;
  shareableLink?: string;
}

export type WorkspaceColor = 'rose' | 'mint' | 'sage' | 'gray' | 'black';

export interface WorkspaceMember {
  userId: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface AIConfig {
  name: string;
  enabled: boolean;
  personality?: 'friendly' | 'strict' | 'funny' | 'socratic';
}

// Chat Types
export interface Message {
  id: string;
  workspaceId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  type: 'user' | 'ai';
  isAI?: boolean;
}

// Whiteboard Types
export interface WhiteboardState {
  strokes: Stroke[];
  currentTool: ToolType;
  currentColor: string;
  currentSize: number;
}

export type ToolType = 'select' | 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'eraser';

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: ToolType;
  timestamp: Date;
}

export interface Point {
  x: number;
  y: number;
}

// Flashcard Types
export interface FlashcardDeck {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceColor?: WorkspaceColor;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'test' | 'deadline' | 'study-session' | 'other';
  createdBy: string;
}

// Pomodoro Types
export interface PomodoroSession {
  id: string;
  workspaceId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  breakDuration: number;
  completed: boolean;
}

// UI State Types
export interface UIState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

// Navigation Types
export type AppRoute = 
  | 'login' 
  | 'register' 
  | 'onboarding' 
  | 'home' 
  | 'calendar' 
  | 'peers' 
  | 'account'
  | 'workspace';

export type WorkspaceView = 
  | 'chat' 
  | 'whiteboard' 
  | 'ai-summary' 
  | 'flashcards' 
  | 'pomodoro' 
  | 'meet' 
  | 'settings';

// Gemini AI Types
export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
    finishReason: string;
  }[];
}
