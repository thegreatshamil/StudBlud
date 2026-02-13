import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { 
  User, 
  Peer, 
  Workspace, 
  Message, 
  CalendarEvent, 
  FlashcardDeck, 
  PomodoroSession,
  AIConfig 
} from '@/types';

// State Interface
interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Workspaces
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentWorkspaceView: 'chat' | 'whiteboard' | 'ai-summary' | 'flashcards' | 'pomodoro' | 'meet' | 'settings';
  
  // Chat
  messages: Record<string, Message[]>;
  
  // Calendar
  events: CalendarEvent[];
  
  // Peers
  peers: Peer[];
  pendingPeers: Peer[];
  
  // Flashcards
  decks: Record<string, FlashcardDeck[]>;
  
  // Pomodoro
  activeSession: PomodoroSession | null;
  
  // UI
  isLoading: boolean;
  modals: {
    createWorkspace: boolean;
    createEvent: boolean;
    peerRequest: boolean;
    premiumUpsell: boolean;
  };
}

// Initial State - Empty, no fake data
const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  workspaces: [],
  currentWorkspace: null,
  currentWorkspaceView: 'chat',
  messages: {},
  events: [],
  peers: [],
  pendingPeers: [],
  decks: {},
  activeSession: null,
  isLoading: false,
  modals: {
    createWorkspace: false,
    createEvent: false,
    peerRequest: false,
    premiumUpsell: false,
  },
};

// Action Types
type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'SET_CURRENT_WORKSPACE'; payload: Workspace | null }
  | { type: 'SET_WORKSPACE_VIEW'; payload: AppState['currentWorkspaceView'] }
  | { type: 'UPDATE_WORKSPACE'; payload: Workspace }
  | { type: 'DELETE_WORKSPACE'; payload: string }
  | { type: 'SET_MESSAGES'; payload: { workspaceId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: { workspaceId: string; message: Message } }
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_PEERS'; payload: Peer[] }
  | { type: 'SET_PENDING_PEERS'; payload: Peer[] }
  | { type: 'ADD_PEER'; payload: Peer }
  | { type: 'ACCEPT_PEER'; payload: string }
  | { type: 'REJECT_PEER'; payload: string }
  | { type: 'SET_DECKS'; payload: { workspaceId: string; decks: FlashcardDeck[] } }
  | { type: 'ADD_DECK'; payload: { workspaceId: string; deck: FlashcardDeck } }
  | { type: 'UPDATE_DECK'; payload: { workspaceId: string; deck: FlashcardDeck } }
  | { type: 'SET_ACTIVE_SESSION'; payload: PomodoroSession | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_MODAL'; payload: { modal: keyof AppState['modals']; open: boolean } }
  | { type: 'UPDATE_AI_CONFIG'; payload: { workspaceId: string; config: AIConfig } }
  | { type: 'RESET_STATE' };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload };
    case 'ADD_WORKSPACE':
      return { 
        ...state, 
        workspaces: [...state.workspaces, action.payload],
        currentWorkspace: action.payload 
      };
    case 'SET_CURRENT_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    case 'SET_WORKSPACE_VIEW':
      return { ...state, currentWorkspaceView: action.payload };
    case 'UPDATE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map(w => 
          w.id === action.payload.id ? action.payload : w
        ),
        currentWorkspace: state.currentWorkspace?.id === action.payload.id 
          ? action.payload 
          : state.currentWorkspace
      };
    case 'DELETE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.filter(w => w.id !== action.payload),
        currentWorkspace: state.currentWorkspace?.id === action.payload 
          ? null 
          : state.currentWorkspace
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.payload.workspaceId]: action.payload.messages }
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.workspaceId]: [
            ...(state.messages[action.payload.workspaceId] || []),
            action.payload.message
          ]
        }
      };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.payload) };
    case 'SET_PEERS':
      return { ...state, peers: action.payload };
    case 'SET_PENDING_PEERS':
      return { ...state, pendingPeers: action.payload };
    case 'ADD_PEER':
      return { ...state, peers: [...state.peers, action.payload] };
    case 'ACCEPT_PEER':
      const acceptedPeer = state.pendingPeers.find(p => p.id === action.payload);
      if (acceptedPeer) {
        return {
          ...state,
          pendingPeers: state.pendingPeers.filter(p => p.id !== action.payload),
          peers: [...state.peers, { ...acceptedPeer, requestStatus: 'accepted' as const }]
        };
      }
      return state;
    case 'REJECT_PEER':
      return {
        ...state,
        pendingPeers: state.pendingPeers.filter(p => p.id !== action.payload)
      };
    case 'SET_DECKS':
      return {
        ...state,
        decks: { ...state.decks, [action.payload.workspaceId]: action.payload.decks }
      };
    case 'ADD_DECK':
      return {
        ...state,
        decks: {
          ...state.decks,
          [action.payload.workspaceId]: [
            ...(state.decks[action.payload.workspaceId] || []),
            action.payload.deck
          ]
        }
      };
    case 'UPDATE_DECK':
      return {
        ...state,
        decks: {
          ...state.decks,
          [action.payload.workspaceId]: state.decks[action.payload.workspaceId]?.map(d =>
            d.id === action.payload.deck.id ? action.payload.deck : d
          ) || []
        }
      };
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload.modal]: action.payload.open }
      };
    case 'UPDATE_AI_CONFIG':
      return {
        ...state,
        workspaces: state.workspaces.map(w =>
          w.id === action.payload.workspaceId
            ? { ...w, aiConfig: action.payload.config }
            : w
        ),
        currentWorkspace: state.currentWorkspace?.id === action.payload.workspaceId
          ? { ...state.currentWorkspace, aiConfig: action.payload.config }
          : state.currentWorkspace
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Provider
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Selectors
export function useUser() {
  const { state } = useStore();
  return state.currentUser;
}

export function useWorkspaces() {
  const { state } = useStore();
  return state.workspaces;
}

export function useCurrentWorkspace() {
  const { state } = useStore();
  return state.currentWorkspace;
}

export function useMessages(workspaceId: string) {
  const { state } = useStore();
  return state.messages[workspaceId] || [];
}

export function useEvents() {
  const { state } = useStore();
  return state.events;
}

export function usePeers() {
  const { state } = useStore();
  return { peers: state.peers, pendingPeers: state.pendingPeers };
}
