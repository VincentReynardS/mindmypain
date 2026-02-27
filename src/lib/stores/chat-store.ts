import { create } from "zustand";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  followUps?: string[];
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  addMessage: (msg: ChatMessage) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

const initialState = {
  messages: [] as ChatMessage[],
  isLoading: false,
  error: null as string | null,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearChat: () => set(initialState),
}));
