import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Checkbox,
  Progress,
  useToast,
  HStack,
  IconButton,
  Spacer,
  useDisclosure,
  Select,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Program, Workout, Exercise, ExerciseSet } from '../types';
import { useRestTimer } from '../hooks/useRestTimer';
import { Logo } from '../components/Logo';
import { ExerciseDemo } from '../components/ExerciseDemo';
import { WorkoutCalendar } from '../components/WorkoutCalendar';
import '../styles/calendar.css';

interface WeightRoomProps {
  clientName: string;
  onBack: () => void;
}

interface ExerciseProgress {
  completed: boolean;
  sets: ExerciseSet[];
  notes?: string;
}

export const WeightRoom: React.FC<WeightRoomProps> = ({ clientName, onBack }) => {
  // Program state
  const [program, setProgram] = useState<Program>({
    id: '',
    clientId: '',
    config: {} as ProgramConfig,
    workouts: [],
    completedWorkouts: [],
    dateCreated: '',
    lastUpdated: ''
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [progress, setProgress] = useState<Record<string, ExerciseProgress>>({});
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
  const [clientNameState, setClientName] = useState(clientName);
  const toast = useToast();
  const { seconds, start: startTimer, stop: stopTimer, reset: resetTimer } = useRestTimer(() => {});

  // Load program on mount
  useEffect(() => {
    const loadProgram = async () => {
      try {
        // Get program from local storage
        const storedProgram = localStorage.getItem('currentProgram');
        console.log('Loading program from localStorage:', storedProgram);
        
        if (!storedProgram) {
          console.log('No program found in localStorage');
          return;
        }

        const parsedProgram = JSON.parse(storedProgram);
        console.log('Parsed program:', parsedProgram);
        
        if (!parsedProgram || !parsedProgram.workouts || !Array.isArray(parsedProgram.workouts)) {
          console.error('Invalid program structure:', parsedProgram);
          return;
        }

        // Get client name
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const client = clients.find((c: any) => c.activeProgram === parsedProgram.id);
        if (client) {
          setClientName(client.name);
        } else {
          setClientName('Sample Client');
        }

        // Set program state
        setProgram(parsedProgram);

        // Find today's workout
        const today = new Date().toISOString().split('T')[0];
        const todayWorkout = parsedProgram.workouts.find(
          (w: Workout) => w.date && w.date.split('T')[0] === today
        );

        if (todayWorkout) {
          console.log('Found today\'s workout:', todayWorkout);
          setSelectedDate(todayWorkout.date);
          setCurrentWorkout(todayWorkout);
          initializeProgress(todayWorkout);
        } else {
          // Find next workout
          const nextWorkout = parsedProgram.workouts.find(
            (w: Workout) => w.date && new Date(w.date) > new Date()
          );
          
          if (nextWorkout) {
            console.log('Found next workout:', nextWorkout);
            setSelectedDate(nextWorkout.date);
            setCurrentWorkout(nextWorkout);
            initializeProgress(nextWorkout);
          } else if (parsedProgram.workouts.length > 0) {
            // If no future workouts, show the last one
            const lastWorkout = parsedProgram.workouts[parsedProgram.workouts.length - 1];
            console.log('Using last workout:', lastWorkout);
            setSelectedDate(lastWorkout.date);
            setCurrentWorkout(lastWorkout);
            initializeProgress(lastWorkout);
          }
        }
      } catch (error) {
        console.error('Error loading program:', error);
      }
    };

    loadProgram();
  }, []);

  // Save program whenever it changes
  useEffect(() => {
    if (program.id) {
      console.log('Saving program to localStorage:', program);
      localStorage.setItem('currentProgram', JSON.stringify(program));
    }
  }, [program]);

  // Debug logs
  useEffect(() => {
    console.log('Program:', program);
    console.log('Workouts:', program.workouts);
  }, [program]);

  const initializeProgress = (workout: Workout) => {
    const newProgress: Record<string, ExerciseProgress> = {};
    
    const initializeExercise = (exercise: Exercise, index: number) => {
      const exerciseId = `${exercise.name}-${index}`;
      newProgress[exerciseId] = {
        completed: false,
        sets: Array(exercise.sets).fill(null).map(() => ({
          reps: exercise.reps,
          weight: exercise.targetWeight || 0,
          completed: false
        })),
        notes: ''
      };
    };

    // Initialize warmup exercises with null check
    if (workout.warmup && Array.isArray(workout.warmup)) {
      workout.warmup.forEach((exercise, index) => initializeExercise(exercise, index));
    }

    // Initialize superset exercises with null check
    if (workout.supersets && Array.isArray(workout.supersets)) {
      workout.supersets.forEach((superset, supersetIndex) => {
        if (superset.exercises && Array.isArray(superset.exercises)) {
          superset.exercises.forEach((exercise, exerciseIndex) => {
            initializeExercise(exercise, supersetIndex * 100 + exerciseIndex);
          });
        }
      });
    }

    // Initialize cooldown exercises with null check
    if (workout.cooldown && Array.isArray(workout.cooldown)) {
      workout.cooldown.forEach((exercise, index) => {
        const cooldownIndex = (workout.supersets?.length || 0) * 100 + index;
        initializeExercise(exercise, cooldownIndex);
      });
    }

    setProgress(newProgress);
  };

  const handleDateChange = (date: string) => {
    if (!date) return;
    
    const selectedWorkout = program.workouts?.find(w => w.date && w.date.split('T')[0] === date.split('T')[0]);
    if (selectedWorkout) {
      setSelectedDate(selectedWorkout.date);
      setCurrentWorkout(selectedWorkout);
      initializeProgress(selectedWorkout);
      setActiveTimers({});
    }
  };

  const handleSetComplete = (exerciseId: string, setIndex: number, completed: boolean) => {
    setProgress(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId].sets.map((set, idx) =>
          idx === setIndex ? { ...set, completed } : set
        ),
        completed: completed && prev[exerciseId].sets.every((set, idx) => 
          idx === setIndex ? completed : set.completed
        )
      }
    }));
  };

  const handleSetWeightChange = (exerciseId: string, setIndex: number, weight: number) => {
    setProgress(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId].sets.map((set, idx) =>
          idx === setIndex ? { ...set, weight } : set
        )
      }
    }));
  };

  const handleSetRepsChange = (exerciseId: string, setIndex: number, reps: number) => {
    setProgress(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        sets: prev[exerciseId].sets.map((set, idx) =>
          idx === setIndex ? { ...set, reps } : set
        )
      }
    }));
  };

  const handleNotesChange = (exerciseId: string, notes: string) => {
    setProgress(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        notes
      }
    }));
  };

  const startRestTimer = (supersetId: string, duration: number) => {
    setActiveTimers(prev => ({
      ...prev,
      [supersetId]: duration
    }));
    startTimer();
  };

  const stopRestTimer = (supersetId: string) => {
    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[supersetId];
      return newTimers;
    });
    stopTimer();
    resetTimer();
  };

  const calculateProgress = () => {
    if (!currentWorkout) return 0;
    const totalSets = Object.values(progress).reduce((total, ex) => total + ex.sets.length, 0);
    const completedSets = Object.values(progress).reduce((total, ex) => 
      total + ex.sets.filter(set => set.completed).length, 0
    );
    return (completedSets / totalSets) * 100;
  };

  const handleWorkoutComplete = () => {
    if (!currentWorkout) return;

    const updatedProgram = {
      ...program,
      completedWorkouts: [...program.completedWorkouts, currentWorkout.id]
    };

    // Update program in state and localStorage
    setProgram(updatedProgram);
    localStorage.setItem('currentProgram', JSON.stringify(updatedProgram));

    toast({
      title: "Workout completed!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const ExerciseRow = ({ exercise, index, supersetId }: { exercise: Exercise; index: number; supersetId?: string }) => {
    const exerciseId = `${exercise.name}-${index}`;
    const exerciseProgress = progress[exerciseId];

    // Debug: Log exercise name
    console.log('Exercise in WeightRoom:', {
      name: exercise.name,
      normalized: exercise.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      id: exerciseId
    });

    if (!exerciseProgress) return null;

    return (
      <Box p={4} bg={exerciseProgress.completed ? 'green.900' : 'gray.800'} borderRadius="md">
        <VStack spacing={4} align="stretch">
          <HStack>
            <Heading size="md">{exercise.name}</Heading>
            <ExerciseDemo exerciseName={exercise.name} />
          </HStack>
          {exercise.percentageOfMax && (
            <Text fontSize="md" color="gray.400">
              Target: {exercise.percentageOfMax}% of max
            </Text>
          )}
          <Table size="lg" variant="simple">
            <Thead>
              <Tr>
                <Th fontSize="lg">Set</Th>
                <Th fontSize="lg">Weight (lbs)</Th>
                <Th fontSize="lg">Reps</Th>
              </Tr>
            </Thead>
            <Tbody>
              {exerciseProgress.sets.map((set, setIndex) => (
                <Tr key={setIndex}>
                  <Td fontSize="xl">{setIndex + 1}</Td>
                  <Td>
                    <NumberInput
                      size="lg"
                      min={0}
                      max={1000}
                      value={set.weight}
                      onChange={(_, value) => handleSetWeightChange(exerciseId, setIndex, value)}
                      width="120px"
                    >
                      <NumberInputField height="60px" fontSize="2xl" />
                    </NumberInput>
                  </Td>
                  <Td>
                    <NumberInput
                      size="lg"
                      min={0}
                      max={100}
                      value={set.reps}
                      onChange={(_, value) => handleSetRepsChange(exerciseId, setIndex, value)}
                      width="100px"
                    >
                      <NumberInputField height="60px" fontSize="2xl" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Input
            placeholder="Notes"
            value={exerciseProgress.notes}
            onChange={(e) => handleNotesChange(exerciseId, e.target.value)}
            size="lg"
            height="50px"
            fontSize="lg"
          />
        </VStack>
      </Box>
    );
  };

  return (
    <Box bg="black" minH="100vh" p={4}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack spacing={4} bg="gray.800" p={4} borderRadius="md" align="center">
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            onClick={onBack}
            variant="ghost"
          />
          <Logo height="70px" />
          <Spacer />
          <Text fontSize="xl" fontWeight="bold">
            {clientNameState}
          </Text>
          <WorkoutCalendar
            workouts={program.workouts}
            selectedDate={selectedDate}
            onDateSelect={handleDateChange}
            completedWorkouts={program.completedWorkouts}
          />
          {currentWorkout && (
            <Button
              colorScheme="green"
              isDisabled={calculateProgress() < 100}
              onClick={handleWorkoutComplete}
              size="sm"
            >
              Complete Workout
            </Button>
          )}
        </HStack>

        {/* Progress Bar */}
        {currentWorkout && (
          <Box bg="gray.800" p={4} borderRadius="md">
            <Text mb={2}>Workout Progress</Text>
            <Progress value={calculateProgress()} colorScheme="green" borderRadius="md" />
          </Box>
        )}

        {/* Workout Content */}
        {currentWorkout ? (
          <VStack spacing={8} align="stretch">
            {/* Warmup */}
            {currentWorkout.warmup && Array.isArray(currentWorkout.warmup) && currentWorkout.warmup.length > 0 && (
              <Box>
                <Text fontSize="xl" fontWeight="bold" mb={4} letterSpacing="wider" color="gray.300">
                  WARM-UP
                </Text>
                <VStack spacing={4} align="stretch">
                  {currentWorkout.warmup.map((exercise, index) => (
                    <ExerciseRow key={index} exercise={exercise} index={index} />
                  ))}
                </VStack>
              </Box>
            )}

            {/* Supersets */}
            {currentWorkout.supersets && Array.isArray(currentWorkout.supersets) && currentWorkout.supersets.map((superset, supersetIndex) => (
              <Box key={supersetIndex}>
                <Text fontSize="xl" fontWeight="bold" mb={4} letterSpacing="wider" color="gray.300">
                  {superset.name?.toUpperCase() || `SUPERSET ${supersetIndex + 1}`}
                </Text>
                <VStack spacing={4} align="stretch">
                  {superset.exercises && Array.isArray(superset.exercises) && superset.exercises.map((exercise, exerciseIndex) => (
                    <ExerciseRow
                      key={exerciseIndex}
                      exercise={exercise}
                      index={supersetIndex * 100 + exerciseIndex}
                      supersetId={`superset-${supersetIndex}`}
                    />
                  ))}
                  {/* Rest Timer for Superset */}
                  <Box p={4} bg="blue.900" borderRadius="md">
                    <HStack spacing={4}>
                      <Text>Rest Timer</Text>
                      {activeTimers[`superset-${supersetIndex}`] ? (
                        <>
                          <Text>{seconds}s</Text>
                          <Button
                            size="sm"
                            onClick={() => stopRestTimer(`superset-${supersetIndex}`)}
                          >
                            Stop Rest
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startRestTimer(`superset-${supersetIndex}`, superset.restBetweenSets || 90)}
                        >
                          Start Rest ({superset.restBetweenSets || 90}s)
                        </Button>
                      )}
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            ))}

            {/* Cooldown */}
            {currentWorkout.cooldown && Array.isArray(currentWorkout.cooldown) && currentWorkout.cooldown.length > 0 && (
              <Box>
                <Text fontSize="xl" fontWeight="bold" mb={4} letterSpacing="wider" color="gray.300">
                  COOL-DOWN
                </Text>
                <VStack spacing={4} align="stretch">
                  {currentWorkout.cooldown.map((exercise, index) => (
                    <ExerciseRow
                      key={index}
                      exercise={exercise}
                      index={(currentWorkout.supersets?.length || 0) * 100 + index}
                    />
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        ) : (
          <VStack spacing={4} align="center" py={8}>
            <Text>Please select a workout date to begin.</Text>
            <WorkoutCalendar
              workouts={program.workouts}
              selectedDate={selectedDate}
              onDateSelect={handleDateChange}
              completedWorkouts={program.completedWorkouts}
            />
          </VStack>
        )}
      </VStack>
    </Box>
  );
};
