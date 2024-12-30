export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ExerciseSet {
  weight?: number;
  reps: number;
  completed?: boolean;
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
  percentageOfMax?: number;
  restBetweenSets?: number;
  targetWeight?: number;
}

export interface Superset {
  name: string;
  exercises: Exercise[];
  restBetweenSets?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  date: string;
  week: number;
  day: number;
  focus: string;
  warmup: Exercise[];
  supersets: Superset[];
  cooldown: Exercise[];
  completed?: boolean;
  notes?: string;
}

export interface ProgramConfig {
  clientId: string;
  clientName: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: 'strength' | 'endurance' | 'power' | 'general';
  raceType: string;
  raceDate: string;
  daysPerWeek: number;
  programLength: number;
  startDate: string;
  workoutDays: DayOfWeek[];
  injury?: {
    type: string;
    severity: 'mild' | 'moderate' | 'severe';
  };
}

export interface Program {
  id: string;
  clientId: string;
  config: ProgramConfig;
  workouts: Workout[];
  completedWorkouts: string[];
  dateCreated: string;
  lastUpdated: string;
}

export interface ProgramPhase {
  name: string;
  dateRange: string;
  weeks: string;
  focus: string;
  keyPoints: string[];
}

export interface ProgramSummary {
  overview: string;
  phases: ProgramPhase[];
  guidelines: string[];
  progressionStrategy: string;
  recoveryStrategy: string;
}
