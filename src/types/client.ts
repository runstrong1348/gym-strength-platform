import { Program } from './program';

export interface Injury {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  dateReported: string;
}

export interface MovementMax {
  weight: number;
  date: string;
  reps?: number;
  notes?: string;
}

export interface WorkoutLog {
  date: string;
  programId: string;
  week: number;
  day: number;
  exercises: {
    name: string;
    sets: {
      weight: number;
      reps: number;
      rpe?: number;
      notes?: string;
    }[];
  }[];
  notes?: string;
  feelingRating: 1 | 2 | 3 | 4 | 5;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  bodyweight?: number;
}

export interface WeeklyProgress {
  week: number;
  programId: string;
  notes: string;
  metrics: {
    averageWorkoutRating: number;
    averageSleepQuality: number;
    averageStressLevel: number;
    averageBodyweight?: number;
    completedWorkouts: number;
    totalWorkouts: number;
  };
  goals: {
    achieved: string[];
    inProgress: string[];
    notes: string;
  };
}

export interface Client {
  id: string;
  name: string;
  dateCreated: string;
  lastUpdated: string;
  goals: string[];
  injuries: string[];
  movementMaxes: Record<string, number>;
  notes: string;
  programs: string[];
  activeProgram: string | null;
  metrics?: {
    totalWorkoutsCompleted: number;
    averageWorkoutRating: number;
    consistencyScore: number;
    currentStreak: number;
    longestStreak: number;
  };
}
