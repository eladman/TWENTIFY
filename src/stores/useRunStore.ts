import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { generateUUID } from '@/utils/uuid';
import type { ActiveRun, CompletedRun, RunTemplate, RunSessionType } from '@/types/run';

interface RunState {
  activeSession: ActiveRun | null;
  history: CompletedRun[];

  startRun: (template: RunTemplate) => void;
  updateElapsed: (seconds: number) => void;
  updateDistance: (meters: number) => void;
  advanceInterval: () => void;
  togglePause: () => void;
  finishRun: (sessionType: RunSessionType) => void;
  abandonRun: () => void;
  markRunSynced: (id: string) => void;
  updateRunId: (oldId: string, newId: string) => void;
}

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
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

      finishRun: (sessionType) => {
        const state = get();
        if (!state.activeSession) return;
        const completed: CompletedRun = {
          id: generateUUID(),
          templateId: state.activeSession.templateId,
          sessionType,
          startedAt: state.activeSession.startedAt,
          completedAt: new Date().toISOString(),
          durationSeconds: state.activeSession.elapsedSeconds,
          distanceMeters: state.activeSession.distanceMeters,
          synced: false,
        };
        set({ activeSession: null, history: [...state.history, completed] });
        const { syncRunSession } = require('@/services/sync');
        void syncRunSession(completed);
      },

      abandonRun: () => set({ activeSession: null }),

      markRunSynced: (id) =>
        set((state) => ({
          history: state.history.map((r) => (r.id === id ? { ...r, synced: true } : r)),
        })),

      updateRunId: (oldId, newId) =>
        set((state) => ({
          history: state.history.map((r) => (r.id === oldId ? { ...r, id: newId } : r)),
        })),
    }),
    {
      name: 'run-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
