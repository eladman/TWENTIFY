import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { ChatMessage, ChatPhase, AiGeneratedPlan } from '@/types/chat';

interface ChatState {
  messages: ChatMessage[];
  phase: ChatPhase;
  pendingPlan: AiGeneratedPlan | null;
  isLoading: boolean;
  conversationId: string | null;

  addMessage: (message: ChatMessage) => void;
  setPhase: (phase: ChatPhase) => void;
  setPendingPlan: (plan: AiGeneratedPlan | null) => void;
  setLoading: (loading: boolean) => void;
  setConversationId: (id: string) => void;
  clearChat: () => void;
  reset: () => void;
}

const initialState = {
  messages: [] as ChatMessage[],
  phase: 'gathering' as ChatPhase,
  pendingPlan: null as AiGeneratedPlan | null,
  isLoading: false,
  conversationId: null as string | null,
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...initialState,

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      setPhase: (phase) => set({ phase }),

      setPendingPlan: (plan) => set({ pendingPlan: plan }),

      setLoading: (loading) => set({ isLoading: loading }),

      setConversationId: (id) => set({ conversationId: id }),

      clearChat: () => set(initialState),

      reset: () => set(initialState),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        messages: state.messages,
        phase: state.phase,
        pendingPlan: state.pendingPlan,
        conversationId: state.conversationId,
      }),
    },
  ),
);
