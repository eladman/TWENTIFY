import { supabase, isSupabaseConfigured } from './supabase';
import { useUserStore } from '@/stores/useUserStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useRunStore } from '@/stores/useRunStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { usePlanStore } from '@/stores/usePlanStore';
import { useCustomExercisesStore, type CustomExercise } from '@/stores/useCustomExercisesStore';
import { generateUUID, isValidUUID } from '@/utils/uuid';
import { toJson } from '@/types/database';
import type { CompletedWorkout } from '@/types/workout';
import type { CompletedRun } from '@/types/run';
import type { NutritionCheckin } from '@/types/nutrition';

// ── Guard ─────────────────────────────────────────────────────────────────────

function isReady(): boolean {
  return isSupabaseConfigured() && !!supabase && !!useUserStore.getState().authUserId;
}

// ── Ensure public.users row exists ───────────────────────────────────────────

let _userEnsured = false;

export async function ensureUserRecord(): Promise<void> {
  if (_userEnsured || !isReady()) return;
  try {
    const { authEmail } = useUserStore.getState();
    const { error } = await supabase!.rpc('ensure_user_record', {
      p_email: authEmail ?? '',
    });
    if (error) return;
    _userEnsured = true;
  } catch {}
}

export function resetUserEnsured(): void {
  _userEnsured = false;
}

// ── User profile ──────────────────────────────────────────────────────────────

export async function syncUserProfile(): Promise<void> {
  if (!isReady()) return;
  try {
    const { authUserId, domains, goal, fitnessLevel, profile } = useUserStore.getState();
    if (!goal || !fitnessLevel) return;
    await supabase!.from('user_profiles').upsert(
      {
        user_id: authUserId!,
        domains,
        goal,
        fitness_level: fitnessLevel,
        age: profile?.age ?? null,
        weight_kg: profile?.weightKg ?? null,
        height_cm: profile?.heightCm ?? null,
        sex: profile?.sex ?? null,
      },
      { onConflict: 'user_id' },
    );
  } catch {}
}

// ── Workout sessions ──────────────────────────────────────────────────────────

export async function syncWorkoutSession(workout: CompletedWorkout): Promise<void> {
  if (!isReady()) return;
  let syncId = workout.id;
  try {
    if (!isValidUUID(syncId)) {
      syncId = generateUUID();
      useWorkoutStore.getState().updateWorkoutId(workout.id, syncId);
    }
    const userId = useUserStore.getState().authUserId!;
    const { error } = await supabase!.from('workout_sessions').upsert(
      {
        id: syncId,
        user_id: userId,
        workout_template: workout.templateId,
        started_at: workout.startedAt,
        completed_at: workout.completedAt,
        duration_seconds: workout.durationSeconds,
        exercises: toJson(workout.exercises),
      },
      { onConflict: 'id' },
    );
    if (!error) {
      useWorkoutStore.getState().markWorkoutSynced(syncId);
    }
  } catch {}
}

// ── Run sessions ──────────────────────────────────────────────────────────────

export async function syncRunSession(run: CompletedRun): Promise<void> {
  if (!isReady()) return;
  let syncId = run.id;
  try {
    if (!isValidUUID(syncId)) {
      syncId = generateUUID();
      useRunStore.getState().updateRunId(run.id, syncId);
    }
    const userId = useUserStore.getState().authUserId!;
    const { error } = await supabase!.from('run_sessions').upsert(
      {
        id: syncId,
        user_id: userId,
        template_id: run.templateId,
        session_type: run.sessionType,
        started_at: run.startedAt,
        completed_at: run.completedAt,
        duration_seconds: run.durationSeconds,
        distance_meters: run.distanceMeters ?? null,
        avg_hr: run.avgHr ?? null,
      },
      { onConflict: 'id' },
    );
    if (!error) {
      useRunStore.getState().markRunSynced(syncId);
    }
  } catch {}
}

// ── Nutrition checkins ────────────────────────────────────────────────────────

export async function syncNutritionCheckin(checkin: NutritionCheckin): Promise<void> {
  if (!isReady()) return;
  try {
    const userId = useUserStore.getState().authUserId!;
    const { error } = await supabase!.from('nutrition_checkins').upsert(
      {
        user_id: userId,
        date: checkin.date,
        protein_servings: checkin.proteinServings,
        veggie_servings: checkin.veggieServings,
        water_glasses: checkin.waterGlasses,
        followed_plan: checkin.followedPlan,
      },
      { onConflict: 'user_id,date' },
    );
    if (error) { /* retry on next sync */ }
  } catch {}
}

// ── Plan ──────────────────────────────────────────────────────────────────────

export async function syncPlan(): Promise<void> {
  if (!isReady()) return;
  try {
    const userId = useUserStore.getState().authUserId!;
    const { weeklySchedule, gymPlan, runPlan, nutritionPlan, currentWeek } =
      usePlanStore.getState();
    const planData = { weeklySchedule, gymPlan, runPlan, nutritionPlan };

    // PostgREST can't match partial unique indexes via onConflict,
    // so use select-then-update/insert instead of upsert.
    const { data: existing } = await supabase!
      .from('plans')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase!
        .from('plans')
        .update({
          plan_type: 'generated',
          plan_data: toJson(planData),
          week_number: currentWeek,
        })
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase!.from('plans').insert({
        user_id: userId,
        plan_type: 'generated',
        plan_data: toJson(planData),
        week_number: currentWeek,
        is_active: true,
      }));
    }

    if (error) { /* retry on next sync */ }
  } catch {}
}

// ── Custom exercises ─────────────────────────────────────────────────────────

export async function syncCustomExercise(exercise: CustomExercise): Promise<void> {
  if (!isReady()) return;
  try {
    const userId = useUserStore.getState().authUserId!;
    const { error } = await supabase!.from('exercises').upsert(
      {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        movement_pattern: exercise.movementPattern,
        primary_muscles: exercise.primaryMuscles,
        secondary_muscles: exercise.secondaryMuscles,
        equipment: exercise.equipment,
        alternatives: exercise.alternatives,
        citation_ids: exercise.citationIds,
        instructions: exercise.instructions ?? null,
        cues: exercise.cues,
        user_id: userId,
      },
      { onConflict: 'id' },
    );
    if (!error) {
      useCustomExercisesStore.getState().markExerciseSynced(exercise.id);
    }
  } catch {}
}

export async function syncDeleteCustomExercise(id: string): Promise<void> {
  if (!isReady()) return;
  try {
    await supabase!.from('exercises').delete().eq('id', id);
  } catch {}
}

// ── Sync all pending (retry queue) ────────────────────────────────────────────

export async function syncAllPending(): Promise<void> {
  if (!isReady()) return;
  await ensureUserRecord();
  try {
    const unsynced = useWorkoutStore.getState().history.filter((w) => !w.synced);
    for (const w of unsynced) await syncWorkoutSession(w);

    const unsyncedRuns = useRunStore.getState().history.filter((r) => !r.synced);
    for (const r of unsyncedRuns) await syncRunSession(r);

    const unsyncedExercises = Object.values(
      useCustomExercisesStore.getState().customExercises,
    ).filter((e) => !e.synced);
    for (const e of unsyncedExercises) await syncCustomExercise(e);

    await syncNutritionCheckin(useNutritionStore.getState().todayCheckin);
    await syncPlan();
  } catch {}
}

// ── Pull from cloud (fresh install restore) ───────────────────────────────────

export async function pullFromCloud(): Promise<void> {
  if (!isReady()) return;
  await ensureUserRecord();

  try {
    const userId = useUserStore.getState().authUserId!;

    const [workoutsRes, runsRes, checkinsRes, plansRes, profileRes, customExRes] = await Promise.all([
      supabase!.from('workout_sessions').select('*').eq('user_id', userId),
      supabase!.from('run_sessions').select('*').eq('user_id', userId),
      supabase!.from('nutrition_checkins').select('*').eq('user_id', userId),
      supabase!.from('plans').select('*').eq('user_id', userId).eq('is_active', true).single(),
      supabase!.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase!.from('exercises').select('*').eq('user_id', userId),
    ]);

    if (workoutsRes.data) {
      const pulled: CompletedWorkout[] = workoutsRes.data.map((row: any) => ({
        id: row.id,
        templateId: row.workout_template,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationSeconds: row.duration_seconds,
        exercises: row.exercises ?? [],
        synced: true,
      }));
      const unsynced = useWorkoutStore.getState().history.filter((w) => !w.synced);
      useWorkoutStore.setState({ history: [...unsynced, ...pulled] });
    }

    if (runsRes.data) {
      const pulled: CompletedRun[] = runsRes.data.map((row: any) => ({
        id: row.id,
        templateId: row.template_id,
        sessionType: row.session_type,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        durationSeconds: row.duration_seconds,
        distanceMeters: row.distance_meters ?? undefined,
        avgHr: row.avg_hr ?? undefined,
        synced: true,
      }));
      const unsynced = useRunStore.getState().history.filter((r) => !r.synced);
      useRunStore.setState({ history: [...unsynced, ...pulled] });
    }

    if (checkinsRes.data) {
      const today = new Date().toISOString().split('T')[0];
      const pulledHistory: NutritionCheckin[] = checkinsRes.data
        .filter((row: any) => row.date !== today)
        .map((row: any) => ({
          date: row.date,
          proteinServings: row.protein_servings,
          veggieServings: row.veggie_servings,
          waterGlasses: row.water_glasses,
          followedPlan: row.followed_plan,
        }));
      const unsyncedNutrition = useNutritionStore.getState().history.filter(
        (c) => !pulledHistory.some((p) => p.date === c.date)
      );
      useNutritionStore.setState({
        history: [...unsyncedNutrition, ...pulledHistory],
      });
    }

    if (plansRes.data) {
      const row = plansRes.data as any;
      usePlanStore.getState().setPlan(row.plan_data ?? {});
    }

    if (profileRes.data) {
      const row = profileRes.data as any;
      useUserStore.getState().setProfile({
        age: row.age ?? undefined,
        weightKg: row.weight_kg ?? undefined,
        heightCm: row.height_cm ?? undefined,
        sex: row.sex ?? undefined,
      });
    }

    if (customExRes.data) {
      const pulled: Record<string, CustomExercise> = {};
      for (const row of customExRes.data as any[]) {
        pulled[row.id] = {
          id: row.id,
          name: row.name,
          category: row.category,
          movementPattern: row.movement_pattern ?? 'accessory',
          primaryMuscles: row.primary_muscles ?? [],
          secondaryMuscles: row.secondary_muscles ?? [],
          equipment: row.equipment,
          alternatives: row.alternatives ?? [],
          citationIds: row.citation_ids ?? [],
          instructions: row.instructions ?? '',
          cues: row.cues ?? [],
          defaultReps: { min: 8, max: 12 },
          defaultSets: 3,
          restSeconds: 90,
          synced: true,
        };
      }
      // Merge: keep local unsynced, add pulled
      const local = useCustomExercisesStore.getState().customExercises;
      const merged: Record<string, CustomExercise> = { ...pulled };
      for (const [id, ex] of Object.entries(local)) {
        if (!ex.synced) merged[id] = ex;
      }
      useCustomExercisesStore.getState().setCustomExercises(merged);
    }

  } catch {}
}

// ── Debounced nutrition helper ────────────────────────────────────────────────

let _nutritionTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSyncNutrition(): void {
  if (_nutritionTimer) clearTimeout(_nutritionTimer);
  _nutritionTimer = setTimeout(() => {
    void syncNutritionCheckin(useNutritionStore.getState().todayCheckin);
  }, 5000);
}
