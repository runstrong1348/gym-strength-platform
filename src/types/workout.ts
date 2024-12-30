export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface WorkoutProgram {
  exercises: Exercise[];
  notes: string[];
}

export interface ActiveClient {
  id: string;
  name: string;
  currentWorkout: {
    name: string;
    exercises: Exercise[];
  };
  startTime: string;
  notes: string[];
}
