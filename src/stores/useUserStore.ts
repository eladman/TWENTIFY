import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type {
  Domain,
  Goal,
  FitnessLevel,
  UserProfile,
  UserSettings,
  SubscriptionTier,
} from '@/types/user';

interface UserState {
  onboardingCompleted: boolean;
  domains: Domain[];
  goal: Goal | null;
  fitnessLevel: FitnessLevel | null;
  profile: UserProfile | null;
  settings: UserSettings;
  subscriptionTier: SubscriptionTier;
  authUserId: string | null;
  authEmail: string | null;

  setDomains: (domains: Domain[]) => void;
  setGoal: (goal: Goal) => void;
  setFitnessLevel: (level: FitnessLevel) => void;
  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setAuth: (userId: string, email: string | null) => void;
  clearAuth: () => void;
  reset: () => void;
}

const initialState = {
  onboardingCompleted: false,
  domains: [] as Domain[],
  goal: null as Goal | null,
  fitnessLevel: null as FitnessLevel | null,
  profile: null as UserProfile | null,
  settings: {
    units: 'metric' as const,
    notifications: true,
    reminderTime: '07:00',
  },
  subscriptionTier: 'free' as SubscriptionTier,
  authUserId: null as string | null,
  authEmail: null as string | null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setDomains: (domains) => set({ domains }),
      setGoal: (goal) => set({ goal }),
      setFitnessLevel: (level) => set({ fitnessLevel: level }),
      setProfile: (profile) => set({ profile }),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),
      setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
      setAuth: (userId, email) => set({ authUserId: userId, authEmail: email }),
      clearAuth: () => set({ authUserId: null, authEmail: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
