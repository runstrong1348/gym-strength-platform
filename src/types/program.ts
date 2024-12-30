export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
}

export interface MainExercise extends Exercise {
  percentageOfMax: number;
}

export interface Superset {
  name: string;
  exercises: Exercise[];
  restBetweenSets: number;
}

export interface Workout {
  id: string;
  name: string;
  day: string;
  exercises: Exercise[];
  date: string;
  week: number;
  focus: string;
  warmup: Exercise[];
  supersets: Superset[];
  cooldown: Exercise[];
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ProgramConfig {
  clientId: string;
  clientName: string;
  experienceLevel: string;
  goal: string;
  raceType: string;
  raceDate: string;
  daysPerWeek: number;
  programLength: number;
  startDate: string;
  workoutDays: string[];
  injury?: {
    type: string;
    severity: 'mild' | 'moderate' | 'severe';
    notes?: string;
  };
}

export interface ProgramPhaseInfo {
  name: string;
  dateRange: string;
  weeks: string;
  focus: string;
  keyPoints: string[];
}

export interface ProgramSummary {
  overview: string;
  phases: ProgramPhaseInfo[];
  guidelines: string[];
  progressionStrategy: string;
  recoveryStrategy: string;
}

export interface CompletedWorkout {
  week: number;
  day: number;
  completedAt: string;
  duration: number; // in minutes
  notes?: string;
}

export interface Program {
  id: string;
  clientId: string;
  config: ProgramConfig;
  workouts: Workout[];
  completedWorkouts: CompletedWorkout[];
  dateCreated: string;
  lastUpdated: string;
  name: string;
  startDate: string;
  endDate: string;
  daysPerWeek: number;
  workoutDays: string[];
}
