import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { ActiveRun, CompletedRun, RunTemplate } from '@/types/run';

interface RunState {
  activeSession: ActiveRun | null;
  history: CompletedRun[];

  startRun: (template: RunTemplate) => void;
  updateElapsed: (seconds: number) => void;
  updateDistance: (meters: number) => void;
  advanceInterval: () => void;
  togglePause: () => void;
  finishRun: () => void;
  abandonRun: () => void;
}

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      activeSession: null,
      history: [],

      startRun: (template) =>
        set({
          activeSession: {
            templateId: template.id,
            startedAt: new Date().toISOString(),
            isPaused: false,
            elapsedSeconds: 0,
            currentIntervalIndex: template.intervals ? 0 : undefined,
          },
        }),

      updateElapsed: (seconds) =>
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: { ...state.activeSession, elapsedSeconds: seconds },
          };
        }),

      updateDistance: (meters) =>
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: { ...state.activeSession, distanceMeters: meters },
          };
        }),

      advanceInterval: () =>
        set((state) => {
          if (!state.activeSession || state.activeSession.currentIntervalIndex === undefined) return state;
          return {
            activeSession: {
              ...state.activeSession,
              currentIntervalIndex: state.activeSession.currentIntervalIndex + 1,
            },
          };
        }),

      togglePause: () =>
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              isPaused: !state.activeSession.isPaused,
            },
          };
        }),

      finishRun: () =>
        set((state) => {
          if (!state.activeSession) return state;
          const completed: CompletedRun = {
            id: Date.now().toString(),
            templateId: state.activeSession.templateId,
            sessionType: 'easy', // will be derived from template in real implementation
            startedAt: state.activeSession.startedAt,
            completedAt: new Date().toISOString(),
            durationSeconds: state.activeSession.elapsedSeconds,
            distanceMeters: state.activeSession.distanceMeters,
          };
          return {
            activeSession: null,
            history: [...state.history, completed],
          };
        }),

      abandonRun: () => set({ activeSession: null }),
    }),
    {
      name: 'run-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
