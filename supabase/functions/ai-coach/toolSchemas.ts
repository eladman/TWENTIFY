// Claude tool_use schemas for structured plan output

export const TOOL_SCHEMAS = [
  {
    name: 'generate_fitness_plan',
    description:
      'Generate a complete structured fitness plan. Use this tool when you have gathered enough information to build the user\'s plan. The plan must use valid exercise IDs from the exercise bank provided in your instructions.',
    input_schema: {
      type: 'object' as const,
      properties: {
        weeklySchedule: {
          type: 'array' as const,
          description: 'Array of 7 day plans (Mon=0 to Sun=6)',
          items: {
            type: 'object' as const,
            properties: {
              dayOfWeek: { type: 'number' as const, description: '0=Monday, 6=Sunday' },
              activity: {
                type: 'string' as const,
                enum: ['gym', 'run', 'rest', 'nutrition_only'],
              },
              workoutTemplate: {
                type: 'object' as const,
                description: 'Required when activity is gym',
                properties: {
                  id: { type: 'string' as const },
                  name: { type: 'string' as const },
                  type: { type: 'string' as const },
                  exercises: {
                    type: 'array' as const,
                    items: {
                      type: 'object' as const,
                      properties: {
                        exerciseId: { type: 'string' as const, description: 'Must be a valid exercise ID from the exercise bank' },
                        sets: {
                          type: 'array' as const,
                          items: {
                            type: 'object' as const,
                            properties: {
                              targetReps: {
                                type: 'array' as const,
                                items: { type: 'number' as const },
                                description: '[min, max] e.g. [6, 8]',
                              },
                              suggestedWeightKg: { type: ['number', 'null'] as const },
                              restSeconds: { type: 'number' as const },
                            },
                            required: ['targetReps', 'suggestedWeightKg', 'restSeconds'],
                          },
                        },
                      },
                      required: ['exerciseId', 'sets'],
                    },
                  },
                  estimatedDurationMin: { type: 'number' as const },
                },
                required: ['id', 'name', 'type', 'exercises', 'estimatedDurationMin'],
              },
              runTemplate: {
                type: 'object' as const,
                description: 'Required when activity is run',
                properties: {
                  id: { type: 'string' as const },
                  name: { type: 'string' as const },
                  type: {
                    type: 'string' as const,
                    enum: ['easy', 'tempo', 'intervals', 'walk_run'],
                  },
                  targetDurationMin: { type: 'number' as const },
                  targetZone: { type: 'string' as const },
                  intervals: {
                    type: 'array' as const,
                    items: {
                      type: 'object' as const,
                      properties: {
                        type: { type: 'string' as const, enum: ['walk', 'run', 'work', 'rest'] },
                        durationSeconds: { type: 'number' as const },
                        targetHrPct: { type: 'number' as const },
                      },
                      required: ['type', 'durationSeconds'],
                    },
                  },
                },
                required: ['id', 'name', 'type', 'targetDurationMin'],
              },
              estimatedDurationMin: { type: 'number' as const },
              label: { type: 'string' as const },
            },
            required: ['dayOfWeek', 'activity', 'estimatedDurationMin', 'label'],
          },
        },
        gymPlan: {
          type: 'object' as const,
          description: 'Gym plan. Include if user selected gym domain.',
          properties: {
            type: {
              type: 'string' as const,
              enum: ['gym_2day', 'gym_3day', 'gym_4day'],
            },
            templates: {
              type: 'array' as const,
              items: {
                type: 'object' as const,
                properties: {
                  id: { type: 'string' as const },
                  name: { type: 'string' as const },
                  type: { type: 'string' as const },
                  exercises: {
                    type: 'array' as const,
                    items: {
                      type: 'object' as const,
                      properties: {
                        exerciseId: { type: 'string' as const },
                        sets: {
                          type: 'array' as const,
                          items: {
                            type: 'object' as const,
                            properties: {
                              targetReps: {
                                type: 'array' as const,
                                items: { type: 'number' as const },
                              },
                              suggestedWeightKg: { type: ['number', 'null'] as const },
                              restSeconds: { type: 'number' as const },
                            },
                            required: ['targetReps', 'suggestedWeightKg', 'restSeconds'],
                          },
                        },
                      },
                      required: ['exerciseId', 'sets'],
                    },
                  },
                  estimatedDurationMin: { type: 'number' as const },
                },
                required: ['id', 'name', 'type', 'exercises', 'estimatedDurationMin'],
              },
            },
          },
          required: ['type', 'templates'],
        },
        runPlan: {
          type: 'object' as const,
          description: 'Run plan. Include if user selected running domain.',
          properties: {
            type: {
              type: 'string' as const,
              enum: ['run_1day', 'run_2day', 'run_3day'],
            },
            templates: {
              type: 'array' as const,
              items: {
                type: 'object' as const,
                properties: {
                  id: { type: 'string' as const },
                  name: { type: 'string' as const },
                  type: { type: 'string' as const, enum: ['easy', 'tempo', 'intervals', 'walk_run'] },
                  targetDurationMin: { type: 'number' as const },
                  targetZone: { type: 'string' as const },
                  intervals: {
                    type: 'array' as const,
                    items: {
                      type: 'object' as const,
                      properties: {
                        type: { type: 'string' as const, enum: ['walk', 'run', 'work', 'rest'] },
                        durationSeconds: { type: 'number' as const },
                        targetHrPct: { type: 'number' as const },
                      },
                      required: ['type', 'durationSeconds'],
                    },
                  },
                },
                required: ['id', 'name', 'type', 'targetDurationMin'],
              },
            },
          },
          required: ['type', 'templates'],
        },
        nutritionPlan: {
          type: 'object' as const,
          description: 'Nutrition plan. Include if user selected nutrition domain.',
          properties: {
            goal: {
              type: 'string' as const,
              enum: ['fat_loss', 'muscle_build', 'maintenance'],
            },
            tdee: { type: 'number' as const },
            calorieTarget: { type: 'number' as const },
            proteinTargetG: { type: 'number' as const },
            proteinPortions: { type: 'number' as const },
            dailyRules: {
              type: 'array' as const,
              items: { type: 'string' as const },
            },
          },
          required: ['goal', 'tdee', 'calorieTarget', 'proteinTargetG', 'proteinPortions', 'dailyRules'],
        },
        explanation: {
          type: 'string' as const,
          description: 'A conversational explanation of the plan with research citations. This will be shown as the assistant message.',
        },
      },
      required: ['weeklySchedule', 'explanation'],
    },
  },
  {
    name: 'ask_user_question',
    description:
      'Ask the user a follow-up question to gather more information for plan creation. Include 2-4 suggested answers that will be shown as quick-reply chips.',
    input_schema: {
      type: 'object' as const,
      properties: {
        question: {
          type: 'string' as const,
          description: 'The question to ask the user',
        },
        suggestedAnswers: {
          type: 'array' as const,
          description: 'Suggested quick-reply options (2-4 items)',
          items: { type: 'string' as const },
        },
      },
      required: ['question', 'suggestedAnswers'],
    },
  },
];
