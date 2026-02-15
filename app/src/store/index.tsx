import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loadUserState, saveUserState } from '@/lib/persistence';

import type {
  User,
  Peer,
  Workspace,
  Message,
  CalendarEvent,
  FlashcardDeck,
  PomodoroSession
} from '@/types';

/* ================= STATE ================= */

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;

  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentWorkspaceView:
  | 'chat'
  | 'whiteboard'
  | 'ai-summary'
  | 'flashcards'
  | 'pomodoro'
  | 'meet'
  | 'settings';

  messages: Record<string, Message[]>;
  events: CalendarEvent[];
  peers: Peer[];
  pendingPeers: Peer[];
  decks: Record<string, FlashcardDeck[]>;
  activeSession: PomodoroSession | null;

  isLoading: boolean;

  modals: {
    createWorkspace: boolean;
    createEvent: boolean;
    peerRequest: boolean;
    premiumUpsell: boolean;
  };
}

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

/* ================= ACTIONS ================= */

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'SET_MESSAGES'; payload: Record<string, Message[]> }
  | { type: 'ADD_MESSAGE'; payload: { workspaceId: string; message: Message } }
  | { type: 'TOGGLE_MODAL'; payload: { modal: keyof AppState['modals']; open: boolean } }
  | { type: 'SET_CURRENT_WORKSPACE'; payload: Workspace | null }
  | { type: 'SET_CURRENT_WORKSPACE_VIEW'; payload: AppState['currentWorkspaceView'] }
  | { type: 'SET_PEERS'; payload: Peer[] }
  | { type: 'SET_PENDING_PEERS'; payload: Peer[] }
  | { type: 'SET_DECKS'; payload: Record<string, FlashcardDeck[]> }
  | { type: 'SET_ACTIVE_SESSION'; payload: PomodoroSession | null }
  | { type: 'SET_LOADING'; payload: boolean };

/* ================= REDUCER ================= */

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload };
    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.payload] };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.workspaceId]: [
            ...(state.messages[action.payload.workspaceId] || []),
            action.payload.message,
          ],
        },
      };
    case 'TOGGLE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.open,
        },
      };
    case 'SET_CURRENT_WORKSPACE':
      return { ...state, currentWorkspace: action.payload };
    case 'SET_CURRENT_WORKSPACE_VIEW':
      return { ...state, currentWorkspaceView: action.payload };
    case 'SET_PEERS':
      return { ...state, peers: action.payload };
    case 'SET_PENDING_PEERS':
      return { ...state, pendingPeers: action.payload };
    case 'SET_DECKS':
      return { ...state, decks: action.payload };
    case 'SET_ACTIVE_SESSION':
      return { ...state, activeSession: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

/* ================= CONTEXT ================= */

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  /* 🔥 LOAD USER DATA FROM FIRESTORE */
  // LOAD USER DATA

  useEffect(() => {
    if (!state.currentUser?.id) return;
    loadUserState(state.currentUser.id).then((data) => {
      if (!data) return;
      dispatch({ type: 'SET_WORKSPACES', payload: data.workspaces ?? [] });
      dispatch({ type: 'SET_EVENTS', payload: data.events ?? [] });
      if (data.messages) {
        dispatch({ type: 'SET_MESSAGES', payload: data.messages });
      }
      if (data.peers) {
        dispatch({ type: 'SET_PEERS', payload: data.peers });
      }
      if (data.pendingPeers) {
        dispatch({ type: 'SET_PENDING_PEERS', payload: data.pendingPeers });
      }
      if (data.decks) {
        dispatch({ type: 'SET_DECKS', payload: data.decks });
      }
      if (data.activeSession) {
        dispatch({ type: 'SET_ACTIVE_SESSION', payload: data.activeSession });
      }
    });
  }, [state.currentUser?.id]);

  // SAVE USER DATA

  useEffect(() => {
    if (!state.currentUser?.id) return;
    saveUserState(state.currentUser.id, {
      workspaces: state.workspaces,
      events: state.events,
      messages: state.messages,
      peers: state.peers,
      pendingPeers: state.pendingPeers,
      decks: state.decks,
      activeSession: state.activeSession,
    });
  }, [
    state.workspaces,
    state.events,
    state.messages,
    state.peers,
    state.pendingPeers,
    state.decks,
    state.activeSession,
    state.currentUser?.id
  ]);


  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
