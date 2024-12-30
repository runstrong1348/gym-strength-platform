import { v4 as uuidv4 } from 'uuid';
import { Program, ProgramConfig } from '../types/program';

export const generateProgram = async (config: ProgramConfig): Promise<Program> => {
  // For now, generate a sample program
  const program: Program = {
    id: uuidv4(),
    name: `${config.clientName}'s ${config.goal} Program`,
    clientId: config.clientId,
    startDate: config.startDate,
    endDate: config.raceDate,
    daysPerWeek: config.daysPerWeek,
    workoutDays: config.workoutDays,
    workouts: [
      {
        id: uuidv4(),
        name: 'Workout 1',
        day: 'monday',
        exercises: [
          {
            id: uuidv4(),
            name: 'Squat',
            sets: 3,
            reps: '5',
            weight: '135',
            notes: 'Focus on form'
          },
          {
            id: uuidv4(),
            name: 'Bench Press',
            sets: 3,
            reps: '5',
            weight: '95',
            notes: 'Keep tight core'
          }
        ]
      },
      {
        id: uuidv4(),
        name: 'Workout 2',
        day: 'wednesday',
        exercises: [
          {
            id: uuidv4(),
            name: 'Deadlift',
            sets: 3,
            reps: '5',
            weight: '185',
            notes: 'Keep back straight'
          },
          {
            id: uuidv4(),
            name: 'Overhead Press',
            sets: 3,
            reps: '5',
            weight: '65',
            notes: 'Full range of motion'
          }
        ]
      }
    ]
  };

  return program;
};
