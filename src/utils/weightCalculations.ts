// Brzycki Formula for 1RM calculation
export const calculateOneRepMax = (weight: number, reps: number): number => {
  return weight / (1.0278 - 0.0278 * reps);
};

// Calculate weight for target percentage of 1RM
export const calculateWeightForPercentage = (oneRepMax: number, targetPercentage: number): number => {
  return oneRepMax * (targetPercentage / 100);
};

// Round weight to nearest increment
export const roundWeight = (weight: number, increment: number = 5): number => {
  return Math.round(weight / increment) * increment;
};

interface ExerciseHistory {
  weight: number;
  reps: number;
  date: string;
}

export interface MovementMaxes {
  [exerciseName: string]: {
    oneRepMax: number;
    history: ExerciseHistory[];
  };
}

// Update movement maxes when a new weight is recorded
export const updateMovementMaxes = (
  currentMaxes: MovementMaxes,
  exerciseName: string,
  weight: number,
  reps: number
): MovementMaxes => {
  const newMaxes = { ...currentMaxes };
  const calculatedMax = calculateOneRepMax(weight, reps);
  
  if (!newMaxes[exerciseName]) {
    newMaxes[exerciseName] = {
      oneRepMax: calculatedMax,
      history: []
    };
  }

  // Update max if new calculated max is higher
  if (calculatedMax > newMaxes[exerciseName].oneRepMax) {
    newMaxes[exerciseName].oneRepMax = calculatedMax;
  }

  // Add to history
  newMaxes[exerciseName].history.push({
    weight,
    reps,
    date: new Date().toISOString()
  });

  // Keep only last 10 entries in history
  if (newMaxes[exerciseName].history.length > 10) {
    newMaxes[exerciseName].history = newMaxes[exerciseName].history.slice(-10);
  }

  return newMaxes;
};
