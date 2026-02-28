import type { Exercise, ExerciseEquipment } from '@/types/workout';

const e = (ex: Exercise): Exercise => ex;

const exerciseArray: Exercise[] = [
  // ── Barbell primaries (7) ──────────────────────────────────────────

  e({
    id: 'barbell_squat',
    name: 'Barbell Back Squat',
    category: 'compound',
    movementPattern: 'squat',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core', 'lower_back'],
    equipment: 'barbell',
    alternatives: ['db_goblet_squat', 'bw_squat', 'leg_press', 'db_lunges'],
    citationIds: ['iversen_2021', 'gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Place the barbell across your upper traps. Unrack, step back, and squat until your hip crease is below your knee. Drive through the whole foot to stand.',
    cues: ['Chest up', 'Knees track over toes', 'Brace your core before descending'],
    defaultReps: { min: 5, max: 8 },
    defaultSets: 4,
    restSeconds: 180,
  }),

  e({
    id: 'conventional_deadlift',
    name: 'Conventional Deadlift',
    category: 'compound',
    movementPattern: 'hinge',
    primaryMuscles: ['hamstrings', 'glutes', 'lower_back'],
    secondaryMuscles: ['quadriceps', 'traps', 'core'],
    equipment: 'barbell',
    alternatives: ['db_romanian_deadlift', 'bw_single_leg_deadlift', 'romanian_deadlift'],
    citationIds: ['iversen_2021', 'gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Stand with feet hip-width apart, barbell over mid-foot. Hinge at the hips, grip the bar just outside your knees, and drive through the floor until lockout.',
    cues: ['Push the floor away', 'Keep the bar close to your body', 'Lock hips and knees together at the top'],
    defaultReps: { min: 3, max: 6 },
    defaultSets: 4,
    restSeconds: 210,
  }),

  e({
    id: 'bench_press',
    name: 'Barbell Bench Press',
    category: 'compound',
    movementPattern: 'push_horizontal',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    alternatives: ['db_bench_press', 'bw_pushup', 'dip', 'bw_dip'],
    citationIds: ['iversen_2021', 'gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Lie on a flat bench with eyes under the bar. Unrack with straight arms, lower the bar to your mid-chest, then press back up to lockout.',
    cues: ['Retract and depress your shoulder blades', 'Feet flat on the floor', 'Touch your chest, don\u2019t bounce'],
    defaultReps: { min: 5, max: 8 },
    defaultSets: 4,
    restSeconds: 180,
  }),

  e({
    id: 'overhead_press',
    name: 'Overhead Press',
    category: 'compound',
    movementPattern: 'push_vertical',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core', 'upper_back'],
    equipment: 'barbell',
    alternatives: ['db_shoulder_press', 'bw_pike_pushup'],
    citationIds: ['iversen_2021', 'gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Start with the barbell at shoulder height. Brace your core, press the bar straight overhead, and push your head through once the bar clears your forehead.',
    cues: ['Squeeze your glutes', 'Stack the bar over your mid-foot', 'Full lockout at the top'],
    defaultReps: { min: 5, max: 8 },
    defaultSets: 4,
    restSeconds: 150,
  }),

  e({
    id: 'barbell_row',
    name: 'Barbell Row',
    category: 'compound',
    movementPattern: 'pull_horizontal',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'rhomboids', 'core'],
    equipment: 'barbell',
    alternatives: ['db_row', 'bw_inverted_row'],
    citationIds: ['iversen_2021', 'gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Hinge forward until your torso is roughly 45 degrees. Pull the barbell to your lower chest, squeezing your shoulder blades together at the top.',
    cues: ['Lead with your elbows', 'Keep your lower back neutral', 'Control the negative'],
    defaultReps: { min: 6, max: 10 },
    defaultSets: 4,
    restSeconds: 150,
  }),

  e({
    id: 'pullup',
    name: 'Pull-Up',
    category: 'compound',
    movementPattern: 'pull_vertical',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'core'],
    equipment: 'bodyweight',
    alternatives: ['bw_pullup', 'lat_pulldown'],
    citationIds: ['iversen_2021', 'gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Hang from a bar with hands just outside shoulder width. Pull yourself up until your chin clears the bar, then lower under control.',
    cues: ['Initiate by depressing your shoulder blades', 'Avoid kipping', 'Full dead hang at the bottom'],
    defaultReps: { min: 4, max: 8 },
    defaultSets: 3,
    restSeconds: 150,
  }),

  e({
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift',
    category: 'compound',
    movementPattern: 'hinge',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'core'],
    equipment: 'barbell',
    alternatives: ['db_romanian_deadlift', 'bw_single_leg_deadlift', 'conventional_deadlift', 'bw_glute_bridge'],
    citationIds: ['iversen_2021', 'gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Hold the barbell at hip height. Push your hips back while keeping a slight knee bend, lowering the bar along your thighs until you feel a deep hamstring stretch. Reverse the motion to stand.',
    cues: ['Hips go back, not down', 'Bar stays close to legs', 'Maintain a neutral spine throughout'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  // ── Optional / accessory (4) ───────────────────────────────────────

  e({
    id: 'dip',
    name: 'Dip',
    category: 'compound',
    movementPattern: 'push_horizontal',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    equipment: 'bodyweight',
    alternatives: ['bw_dip', 'bench_press', 'db_bench_press', 'bw_pushup'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Support yourself on parallel bars with arms locked. Lower your body by bending your elbows until your upper arms are roughly parallel with the floor, then press back up.',
    cues: ['Lean slightly forward for chest emphasis', 'Keep elbows tucked', 'Full lockout at the top'],
    defaultReps: { min: 6, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  e({
    id: 'leg_press',
    name: 'Leg Press',
    category: 'compound',
    movementPattern: 'squat',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'machine',
    alternatives: ['barbell_squat', 'db_goblet_squat', 'bw_squat'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Sit in the leg press machine with your feet shoulder-width apart on the platform. Lower the sled until your knees reach about 90 degrees, then press through the whole foot to extend.',
    cues: ['Don\u2019t lock out your knees completely', 'Keep your lower back against the pad', 'Control the descent'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  e({
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    category: 'compound',
    movementPattern: 'pull_vertical',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids'],
    equipment: 'cable',
    alternatives: ['pullup', 'bw_pullup'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Sit at a lat pulldown machine, grip the bar slightly wider than shoulder width. Pull the bar to your upper chest while squeezing your lats, then slowly return.',
    cues: ['Lean back slightly', 'Drive your elbows toward your hips', 'Don\u2019t use momentum'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 90,
  }),

  e({
    id: 'calf_raise',
    name: 'Standing Calf Raise',
    category: 'isolation',
    movementPattern: 'accessory',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: 'machine',
    alternatives: [],
    citationIds: ['schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Stand on a calf raise platform with the balls of your feet on the edge. Rise up onto your toes as high as possible, pause briefly, then lower under control until your heels are below the platform.',
    cues: ['Full range of motion', 'Pause at the top for a squeeze', 'Slow controlled negative'],
    defaultReps: { min: 12, max: 20 },
    defaultSets: 3,
    restSeconds: 60,
  }),

  // ── Dumbbell alternatives (6) ──────────────────────────────────────

  e({
    id: 'db_goblet_squat',
    name: 'Dumbbell Goblet Squat',
    category: 'compound',
    movementPattern: 'squat',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: 'dumbbell',
    alternatives: ['barbell_squat', 'bw_squat', 'leg_press', 'db_lunges'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Hold a dumbbell vertically at chest height with both hands cupping one end. Squat down between your knees, keeping your torso upright, then stand back up.',
    cues: ['Elbows inside the knees', 'Chest stays tall', 'Sit between your legs, not behind them'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  e({
    id: 'db_romanian_deadlift',
    name: 'Dumbbell Romanian Deadlift',
    category: 'compound',
    movementPattern: 'hinge',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower_back', 'core'],
    equipment: 'dumbbell',
    alternatives: ['romanian_deadlift', 'conventional_deadlift', 'bw_single_leg_deadlift', 'bw_glute_bridge'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Hold a dumbbell in each hand at your sides. Push your hips back with a slight knee bend, lowering the dumbbells along your legs until you feel a hamstring stretch. Return to standing.',
    cues: ['Hips go back, not down', 'Dumbbells stay close to your legs', 'Neutral spine throughout'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  e({
    id: 'db_bench_press',
    name: 'Dumbbell Bench Press',
    category: 'compound',
    movementPattern: 'push_horizontal',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'dumbbell',
    alternatives: ['bench_press', 'bw_pushup', 'dip'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Lie on a flat bench holding a dumbbell in each hand at chest level. Press both dumbbells up until your arms are extended, then lower under control.',
    cues: ['Slight arch in your upper back', 'Lower until upper arms are parallel to the floor', 'Press the dumbbells together at the top'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  e({
    id: 'db_shoulder_press',
    name: 'Dumbbell Shoulder Press',
    category: 'compound',
    movementPattern: 'push_vertical',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    equipment: 'dumbbell',
    alternatives: ['overhead_press', 'bw_pike_pushup'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Sit or stand holding dumbbells at shoulder height with palms facing forward. Press both dumbbells overhead until your arms are fully extended, then lower back to shoulder height.',
    cues: ['Core stays tight', 'Don\u2019t flare your ribs', 'Full lockout overhead'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  e({
    id: 'db_row',
    name: 'Dumbbell Row',
    category: 'compound',
    movementPattern: 'pull_horizontal',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'rhomboids'],
    equipment: 'dumbbell',
    alternatives: ['barbell_row', 'bw_inverted_row'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Place one hand and knee on a bench for support. Row a dumbbell from a dead hang to your hip, squeezing your shoulder blade at the top. Repeat on both sides.',
    cues: ['Pull to your hip, not your shoulder', 'Keep your torso stable', 'Full stretch at the bottom'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 90,
  }),

  e({
    id: 'db_lunges',
    name: 'Dumbbell Lunges',
    category: 'compound',
    movementPattern: 'squat',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: 'dumbbell',
    alternatives: ['barbell_squat', 'db_goblet_squat', 'bw_squat'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Hold a dumbbell in each hand at your sides. Step forward with one leg and lower your back knee toward the floor until both knees are at roughly 90 degrees. Push off the front foot to return.',
    cues: ['Upright torso', 'Front knee tracks over toes', 'Step far enough that your shin stays vertical'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  // ── Bodyweight alternatives (8) ────────────────────────────────────

  e({
    id: 'bw_squat',
    name: 'Bodyweight Squat',
    category: 'bodyweight',
    movementPattern: 'squat',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: 'bodyweight',
    alternatives: ['barbell_squat', 'db_goblet_squat', 'leg_press', 'db_lunges'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Stand with feet shoulder-width apart. Squat down until your hip crease is below your knees, keeping your weight on your whole foot. Stand back up.',
    cues: ['Arms out front for balance', 'Chest up', 'Push your knees out over your toes'],
    defaultReps: { min: 12, max: 20 },
    defaultSets: 3,
    restSeconds: 60,
  }),

  e({
    id: 'bw_pushup',
    name: 'Push-Up',
    category: 'bodyweight',
    movementPattern: 'push_horizontal',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'core'],
    equipment: 'bodyweight',
    alternatives: ['bench_press', 'db_bench_press', 'dip', 'bw_dip'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Start in a high plank with hands just outside shoulder width. Lower your body until your chest nearly touches the floor, then push back up to full arm extension.',
    cues: ['Body stays in a straight line', 'Elbows at about 45 degrees', 'Full range of motion'],
    defaultReps: { min: 10, max: 20 },
    defaultSets: 3,
    restSeconds: 60,
  }),

  e({
    id: 'bw_pike_pushup',
    name: 'Pike Push-Up',
    category: 'bodyweight',
    movementPattern: 'push_vertical',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    equipment: 'bodyweight',
    alternatives: ['overhead_press', 'db_shoulder_press'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Start in a downward-dog position with hands shoulder-width apart and hips piked high. Bend your elbows to lower the top of your head toward the floor, then press back up.',
    cues: ['Keep your hips high', 'Head goes between your hands', 'Elbows point back, not out'],
    defaultReps: { min: 8, max: 15 },
    defaultSets: 3,
    restSeconds: 90,
  }),

  e({
    id: 'bw_inverted_row',
    name: 'Inverted Row',
    category: 'bodyweight',
    movementPattern: 'pull_horizontal',
    primaryMuscles: ['lats', 'upper_back'],
    secondaryMuscles: ['biceps', 'rhomboids', 'core'],
    equipment: 'bodyweight',
    alternatives: ['barbell_row', 'db_row'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Lie under a bar set at roughly waist height. Grip the bar with hands shoulder-width apart and pull your chest to the bar while keeping your body straight. Lower under control.',
    cues: ['Squeeze your shoulder blades at the top', 'Body stays rigid like a plank', 'Full arm extension at the bottom'],
    defaultReps: { min: 8, max: 15 },
    defaultSets: 3,
    restSeconds: 90,
  }),

  e({
    id: 'bw_single_leg_deadlift',
    name: 'Single-Leg Deadlift',
    category: 'bodyweight',
    movementPattern: 'hinge',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['core', 'lower_back'],
    equipment: 'bodyweight',
    alternatives: ['romanian_deadlift', 'db_romanian_deadlift', 'conventional_deadlift'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Stand on one leg with a slight knee bend. Hinge at the hip, extending the free leg behind you as a counterbalance, until your torso is roughly parallel to the floor. Return to standing.',
    cues: ['Hips stay square to the floor', 'Reach long through your back leg', 'Slow and controlled'],
    defaultReps: { min: 8, max: 12 },
    defaultSets: 3,
    restSeconds: 90,
  }),

  e({
    id: 'bw_pullup',
    name: 'Pull-Up (Bodyweight Tier)',
    category: 'bodyweight',
    movementPattern: 'pull_vertical',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'core'],
    equipment: 'bodyweight',
    alternatives: ['pullup', 'lat_pulldown'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Hang from a bar with hands just outside shoulder width. Pull yourself up until your chin clears the bar, then lower under control. Use band assistance or negatives if needed.',
    cues: ['Depress your shoulders first', 'Avoid swinging', 'Full dead hang between reps'],
    defaultReps: { min: 3, max: 8 },
    defaultSets: 3,
    restSeconds: 120,
  }),

  e({
    id: 'bw_glute_bridge',
    name: 'Glute Bridge',
    category: 'bodyweight',
    movementPattern: 'hinge',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: 'bodyweight',
    alternatives: ['romanian_deadlift', 'db_romanian_deadlift'],
    citationIds: ['schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Lie face-up with knees bent and feet flat on the floor. Drive through your heels to lift your hips until your body forms a straight line from shoulders to knees. Squeeze at the top and lower.',
    cues: ['Squeeze glutes hard at the top', 'Don\u2019t hyperextend your lower back', 'Push through your heels'],
    defaultReps: { min: 12, max: 20 },
    defaultSets: 3,
    restSeconds: 60,
  }),

  e({
    id: 'bw_dip',
    name: 'Bodyweight Dip',
    category: 'bodyweight',
    movementPattern: 'push_horizontal',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    equipment: 'bodyweight',
    alternatives: ['dip', 'bench_press', 'bw_pushup'],
    citationIds: ['gentil_2013', 'schoenfeld_2017_volume', 'schoenfeld_2017_load', 'currier_2023', 'kraemer_2004', 'schoenfeld_2024_rest', 'schoenfeld_2016_frequency'],
    instructions:
      'Support yourself on parallel bars or a sturdy surface. Lower your body by bending your elbows until your upper arms are roughly parallel with the floor, then press back up. Modify on a bench if needed.',
    cues: ['Lean slightly forward for chest emphasis', 'Elbows stay tucked', 'Full lockout at the top'],
    defaultReps: { min: 6, max: 12 },
    defaultSets: 3,
    restSeconds: 90,
  }),
];

// ── Exports ────────────────────────────────────────────────────────────

export const exercises: Record<string, Exercise> = Object.fromEntries(
  exerciseArray.map((ex) => [ex.id, ex]),
);

export const exerciseList: Exercise[] = exerciseArray;

export function getExercisesByEquipment(equipment: ExerciseEquipment): Exercise[] {
  return exerciseArray.filter((ex) => ex.equipment === equipment);
}

export function getAlternatives(exerciseId: string): Exercise[] {
  const exercise = exercises[exerciseId];
  if (!exercise) return [];
  return exercise.alternatives
    .map((altId) => exercises[altId])
    .filter((ex): ex is Exercise => ex != null);
}
